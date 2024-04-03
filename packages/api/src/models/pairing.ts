export interface Pair<L, R> {
    left: L;
    right: R;
    compatibility: number;
}

export abstract class Pairing<L, R = L> {
    public left: L[];
    public right: R[];
    private _pairs: Pair<L, R>[] | null = null;
    private _matrix: number[][] | null = null;
    private _avgMatrixCompatibility: number | null = null;
    private _avgPairCompatibility: number | null = null;
    private _stdDev: number | null = null;

    constructor(left: L[], right: R[]) {
        this.left = left;
        this.right = right;
    }

    get pairs(): Pair<L, R>[] {
        if (this._pairs === null) {
            throw new Error('Pairs not calculated');
        }

        return this._pairs;
    }

    get matrix(): number[][] {
        if (this._matrix === null) {
            throw new Error('Matrix not calculated');
        }

        return this._matrix;
    }

    get avgCompatibility(): number {
        if (this._avgPairCompatibility === null) {
            throw new Error('Average compatibility not calculated');
        }

        return this._avgPairCompatibility;
    }

    get stdDev(): number {
        if (this._stdDev === null) {
            throw new Error('Standard deviation not calculated');
        }

        return this._stdDev;
    }

    pair(): Pair<L, R>[] {
        [this._matrix, this._avgMatrixCompatibility] =
            this.getCompatibilityMatrix();
        this._pairs = [];

        const pairedLeft = new Array(this.left.length).fill(false);
        let leftPairs = 0;
        const pairedRight = new Array(this.right.length).fill(false);
        let rightPairs = 0;

        let total: number | null = null;

        while (
            this._pairs.length < Math.max(this.left.length, this.right.length)
        ) {
            let max_score = -Infinity;
            let max_left = -1;
            let max_right = -1;

            for (const [left_index, right_index] of this.iteratePairs()) {
                if (!pairedLeft[left_index] && !pairedRight[right_index]) {
                    const score = this.calculateScore(
                        this._matrix[left_index][right_index],
                        this._avgMatrixCompatibility,
                        total,
                        this._pairs.length,
                    );

                    if (score > max_score) {
                        max_score = score;
                        max_left = left_index;
                        max_right = right_index;
                    }
                }
            }

            if (max_left === -1 || max_right === -1) {
                throw new Error('No more pairs to make');
            }

            pairedLeft[max_left] = true;
            pairedRight[max_right] = true;
            leftPairs++;
            rightPairs++;
            total = (total ?? 0) + this._matrix[max_left][max_right];
            this._pairs.push({
                left: this.left[max_left],
                right: this.right[max_right],
                compatibility: this._matrix[max_left][max_right],
            });

            if (
                this.left.length > this.right.length &&
                rightPairs === this.right.length
            ) {
                pairedRight.fill(false);
                rightPairs = 0;
            }
            if (
                this.right.length > this.left.length &&
                leftPairs === this.left.length
            ) {
                pairedLeft.fill(false);
                leftPairs = 0;
            }
        }

        this._avgPairCompatibility = (total ?? 0) / this._pairs.length;
        this._stdDev = this.calculateStandardDeviation();

        return this._pairs;
    }

    protected abstract computeCompatibility(l: L, r: R): number;

    private calculateScore(
        compatibility: number,
        avgCompatibility: number,
        totalCompatibility: number | null,
        pairsLength: number,
    ): number {
        let score = compatibility - Math.abs(compatibility - avgCompatibility);
        if (totalCompatibility !== null) {
            score -= Math.abs(compatibility - totalCompatibility / pairsLength);
        }

        return score;
    }

    private *iteratePairs() {
        for (let left_index = 0; left_index < this.left.length; left_index++) {
            for (
                let right_index = 0;
                right_index < this.right.length;
                right_index++
            ) {
                yield [left_index, right_index];
            }
        }
    }

    private getCompatibilityMatrix(): [matrix: number[][], avg: number] {
        const matrix: number[][] = [];
        let total = 0;

        for (const l of this.left) {
            const row: number[] = [];
            for (const r of this.right) {
                const compatibility = this.computeCompatibility(l, r);
                row.push(compatibility);
                total += compatibility;
            }
            matrix.push(row);
        }

        return [matrix, total / (this.left.length * this.right.length)];
    }

    private calculateStandardDeviation(): number {
        return Math.sqrt(
            this.pairs.reduce(
                (acc, pair) =>
                    acc +
                    (pair.compatibility - (this._avgPairCompatibility ?? 0)) **
                        2,
                0,
            ) / this.pairs.length,
        );
    }
}
