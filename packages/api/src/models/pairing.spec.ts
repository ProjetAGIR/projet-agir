import { Pairing } from './pairing';

class PairingTest extends Pairing<number> {
    protected computeCompatibility(l: number, r: number): number {
        const lengthDifference = Math.abs(l - r);

        return lengthDifference === 0
            ? 1
            : Math.max(0, 1 - lengthDifference / 20);
    }
}

describe('Pairing', () => {
    it('should pair equals', () => {
        const pairing = new PairingTest([1, 2, 3], [1, 2, 3]);
        const pairs = pairing.pair();

        const expectedPairs = [
            { left: 1, right: 1 },
            { left: 2, right: 2 },
            { left: 3, right: 3 },
        ];

        for (let i = 0; i < pairs.length; i++) {
            expect(pairs[i].left).toBe(expectedPairs[i].left);
            expect(pairs[i].right).toBe(expectedPairs[i].right);
        }
    });

    it('should pair equals if more left', () => {
        const pairing = new PairingTest([1, 2, 3, 1], [1, 2, 3]);
        const pairs = pairing.pair();

        const expectedPairs = [
            { left: 1, right: 1 },
            { left: 2, right: 2 },
            { left: 3, right: 3 },
            { left: 1, right: 1 },
        ];

        for (let i = 0; i < pairs.length; i++) {
            expect(pairs[i].left).toBe(expectedPairs[i].left);
            expect(pairs[i].right).toBe(expectedPairs[i].right);
        }
    });

    it('should pair equals if more right', () => {
        const pairing = new PairingTest([1, 2, 3], [1, 2, 3, 1]);
        const pairs = pairing.pair();

        const expectedPairs = [
            { left: 1, right: 1 },
            { left: 2, right: 2 },
            { left: 3, right: 3 },
            { left: 1, right: 1 },
        ];

        for (let i = 0; i < pairs.length; i++) {
            expect(pairs[i].left).toBe(expectedPairs[i].left);
            expect(pairs[i].right).toBe(expectedPairs[i].right);
        }
    });

    it('should pair minimize variance', () => {
        const pairing = new PairingTest([1, 2, 3], [4, 5, 6]);
        const pairs = pairing.pair();

        const expectedPairs = [
            { left: 1, right: 4 },
            { left: 2, right: 5 },
            { left: 3, right: 6 },
        ];

        for (let i = 0; i < pairs.length; i++) {
            expect(pairs[i].left).toBe(expectedPairs[i].left);
            expect(pairs[i].right).toBe(expectedPairs[i].right);
        }
    });

    it('should pair minimize variance if more left', () => {
        const pairing = new PairingTest([1, 2, 3, 1], [4, 5, 6]);
        const pairs = pairing.pair();

        const expectedPairs = [
            { left: 1, right: 4 },
            { left: 2, right: 5 },
            { left: 3, right: 6 },
            { left: 1, right: 4 },
        ];

        for (let i = 0; i < pairs.length; i++) {
            expect(pairs[i].left).toBe(expectedPairs[i].left);
            expect(pairs[i].right).toBe(expectedPairs[i].right);
        }
    });

    it('should pair minimize variance if more right', () => {
        const pairing = new PairingTest([1, 2, 3], [4, 5, 6, 1]);
        const pairs = pairing.pair();

        const expectedPairs = [
            { left: 1, right: 1 },
            { left: 3, right: 4 },
            { left: 2, right: 5 },
            { left: 3, right: 6 },
        ];

        for (let i = 0; i < pairs.length; i++) {
            expect(pairs[i].left).toBe(expectedPairs[i].left);
            expect(pairs[i].right).toBe(expectedPairs[i].right);
        }
    });

    it('should calculate std deviation to 0 if all same', () => {
        const pairing = new PairingTest([1, 2, 3], [4, 5, 6]);
        pairing.pair();

        expect(pairing.stdDev).toBe(0);
    });

    it('should calculate std deviation', () => {
        const pairing = new PairingTest([1, 2, 3], [4, 5, 6, 1]);
        pairing.pair();

        expect(pairing.stdDev).toBeCloseTo(0.065, 4);
    });

    it('should throw if access values without pairing', () => {
        const pairing = new PairingTest([1, 2, 3], [4, 5, 6, 1]);

        expect(() => pairing.pairs).toThrow();
        expect(() => pairing.matrix).toThrow();
        expect(() => pairing.avgCompatibility).toThrow();
        expect(() => pairing.stdDev).toThrow();
    });

    it('should pair if only one of each', () => {
        const pairing = new PairingTest([1], [1]);
        const pairs = pairing.pair();

        expect(pairs.length).toBe(1);
        expect(pairs[0].left).toBe(1);
        expect(pairs[0].right).toBe(1);
    });

    it('should work if empty arrays', () => {
        const pairing = new PairingTest([], []);
        const pairs = pairing.pair();

        expect(pairs.length).toBe(0);
    });
});
