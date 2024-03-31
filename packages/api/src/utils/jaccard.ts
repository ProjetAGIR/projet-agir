// https://en.wikipedia.org/wiki/Jaccard_index
export const jaccard = <T>(left: T[], right: T[]) => {
    const intesection = left.filter((value) => right.includes(value));
    const union = [...new Set([...left, ...right])];

    return intesection.length / union.length;
};
