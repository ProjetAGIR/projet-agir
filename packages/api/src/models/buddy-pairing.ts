import { UserProfile } from 'common/models/user';
import { Pairing } from './pairing';
import { jaccard } from '../utils/jaccard';

export type BuddyPairingUser = Required<
    Pick<
        UserProfile,
        | 'userId'
        | 'name'
        | 'associations'
        | 'interests'
        | 'languages'
        | 'program'
    >
>;

export const toBuddyPairingUser = (
    user: Partial<Omit<BuddyPairingUser, 'userId'>> &
        Pick<BuddyPairingUser, 'userId'>,
): BuddyPairingUser => ({
    userId: user.userId,
    name: user.name ?? '',
    associations: user.associations ?? [],
    interests: user.interests ?? [],
    languages: user.languages ?? [],
    program: user.program ?? Math.random().toString(), // Use math random to not associate together people with no program
});

export type BuddyPairingCompatibility = {
    [key in keyof Pick<
        BuddyPairingUser,
        'associations' | 'interests' | 'languages' | 'program'
    >]: number;
};

export const BUDDY_PAIRING_WEIGHTS: BuddyPairingCompatibility = {
    associations: 1,
    interests: 1,
    languages: 1,
    program: 1,
};

const BUDDY_PAIRING_WEIGHTS_TOTAL = Object.values(BUDDY_PAIRING_WEIGHTS).reduce(
    (acc, val) => acc + val,
    0,
);

export class BuddyPairing extends Pairing<BuddyPairingUser> {
    protected computeCompatibility(
        l: BuddyPairingUser,
        r: BuddyPairingUser,
    ): number {
        const compatibilities: BuddyPairingCompatibility = {
            associations: jaccard(l.associations, r.associations),
            interests: jaccard(l.interests, r.interests),
            languages: jaccard(l.languages, r.languages),
            program: l.program === r.program ? 1 : 0,
        };

        return (
            Object.entries(compatibilities).reduce(
                (acc, [key, val]) =>
                    acc +
                    val *
                        BUDDY_PAIRING_WEIGHTS[
                            key as keyof BuddyPairingCompatibility
                        ],
                0,
            ) / BUDDY_PAIRING_WEIGHTS_TOTAL
        );
    }
}
