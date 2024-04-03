import { RandomSeed } from 'random-seed';

export const popRandom = <T>(array: T[], rand?: RandomSeed): T => {
    if (array.length === 0) throw new Error('Array is empty');
    const index = rand
        ? rand.intBetween(0, array.length - 1)
        : Math.floor(Math.random() * array.length);
    const element = array[index];
    array.splice(index, 1);
    return element;
};

export const randomSample = <T>(
    array: T[],
    n: number,
    rand?: RandomSeed,
): T[] => {
    const copy = [...array];
    const sample = [];
    for (let i = 0; i < n; i++) {
        sample.push(popRandom(copy, rand));
    }
    return sample;
};
