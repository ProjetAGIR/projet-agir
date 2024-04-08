import { RandomSeed, create } from 'random-seed';
import { PROGRAMS_ARRAY } from 'common';
import { ASSOCIATIONS, INTERESTS } from '../constants/user-profile';
import { popRandom, randomSample } from '../utils/random';
import { BuddyPairing, BuddyPairingUser } from './buddy-pairing';

const randomUser = (rand: RandomSeed): BuddyPairingUser => ({
    userId: rand.intBetween(1, 10000),
    name: rand.random().toString(),
    associations: randomSample(
        ASSOCIATIONS,
        Math.floor(Math.random() * 5) + 1,
        rand,
    ),
    interests: randomSample(INTERESTS, Math.floor(Math.random() * 5) + 1, rand),
    languages: randomSample(
        ['en', 'es', 'fr', 'de'],
        Math.floor(Math.random() * 2) + 1,
        rand,
    ),
    program: popRandom([...PROGRAMS_ARRAY], rand).id,
});

describe('BuddyPairing', () => {
    it('should pair', () => {
        const N = 100;
        const rand = create('test');
        const newUsers = Array.from({ length: N }, () => randomUser(rand));
        const mentors = Array.from({ length: Math.floor(N * 0.33) }, () =>
            randomUser(rand),
        );

        const pairing = new BuddyPairing(newUsers, mentors);
        pairing.pair();

        expect(pairing.pairs.length).toBe(N);
        expect(pairing.avgCompatibility).toBeGreaterThan(0);
    });
});
