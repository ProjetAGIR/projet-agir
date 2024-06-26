import { Knex } from 'knex';
import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { User, UserProfile, UserProfileDB } from 'common/models/user';
import { NoId, TypeOfId } from 'common/types/id';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { UserValidationService } from '../user-validation-service/user-validation-service';
import {
    ASSOCIATIONS,
    DRINKING_HABITS,
    DRUGS_HABITS,
    INTERESTS,
    USER_TYPE,
    SMOKING_HABITS,
    ZODIAC_SIGNS,
} from '../../constants/user-profile';
import { PROGRAMS_ARRAY } from 'common';
@singleton()
export class UserProfileService {
    constructor(
        private readonly databaserService: DatabaseService,
        private readonly userValidationService: UserValidationService,
    ) {}

    private get userProfiles(): Knex.QueryBuilder<UserProfileDB> {
        return this.databaserService.database<UserProfileDB>('userProfiles');
    }

    /**
     * Creates an empty entry for a user
     *
     * @param userId ID of the user to create a profile for
     */
    async initUserProfile(userId: TypeOfId<User>): Promise<void> {
        await this.userProfiles.insert({ userId });
    }

    /**
     * Get a user's profile
     *
     * @param userId ID of the user to get the profile for
     * @returns The user's profile
     */
    async getUserProfile(userId: TypeOfId<User>): Promise<NoId<UserProfile>> {
        const res = await this.userProfiles.select().where({ userId }).first();

        if (!res) {
            throw new HttpException(
                'User profile not found',
                StatusCodes.NOT_FOUND,
            );
        }

        delete res.userId;

        return this.fromUserProfileDB(res);
    }

    /**
     * Update a user's profile
     *
     * @param userId ID of the user to update the profile for
     * @param userProfile The new profile
     */
    async setUserProfile(
        userId: TypeOfId<User>,
        userProfile: UserProfile,
    ): Promise<void> {
        const converted = this.toUserProfileDB(userProfile);
        const update: {
            [K in keyof Omit<UserProfileDB, 'userId'>]: UserProfileDB[K] | null;
        } = {
            name: converted.name ?? null,
            age: converted.age ?? null,
            bio: converted.bio ?? null,
            picture1: converted.picture1 ?? null,
            picture2: converted.picture2 ?? null,
            picture3: converted.picture3 ?? null,
            picture4: converted.picture4 ?? null,
            picture5: converted.picture5 ?? null,
            picture6: converted.picture6 ?? null,
            interests: converted.interests ?? null,
            usertype: converted.usertype ?? null,
            associations: converted.associations ?? null,
            program: converted.program ?? null,
            educationLevel: converted.educationLevel ?? null,
            languages: converted.languages ?? null,
            zodiacSign: converted.zodiacSign ?? null,
            drinking: converted.drinking ?? null,
            smoking: converted.smoking ?? null,
            drugs: converted.drugs ?? null,
            workout: converted.workout ?? null,
            jobTitle: converted.jobTitle ?? null,
            jobCompany: converted.jobCompany ?? null,
            livingIn: converted.livingIn ?? null,
            updatedAt: new Date(),
            automaticallyConnect: converted.automaticallyConnect ?? null,
        };

        this.validateUserProfile(userProfile);

        if (await this.userProfiles.select().where({ userId }).first()) {
            await this.userProfiles
                .update(update as UserProfileDB)
                .where({ userId });
        } else {
            await this.userProfiles.insert({
                ...(update as UserProfileDB),
                userId,
            });
        }

        await this.userValidationService.setUserProfileReady(
            userId,
            this.isUserProfileReady(userProfile),
        );
    }

    private toUserProfileDB(userProfile: UserProfile): UserProfileDB {
        return {
            ...userProfile,
            picture1: userProfile.pictures?.[0],
            picture2: userProfile.pictures?.[1],
            picture3: userProfile.pictures?.[2],
            picture4: userProfile.pictures?.[3],
            picture5: userProfile.pictures?.[4],
            picture6: userProfile.pictures?.[5],
            interests: userProfile.interests
                ?.filter((interest) => interest && interest.length > 0)
                .join(','),
            associations: userProfile.associations
                ?.filter((association) => association && association.length > 0)
                .join(','),
            languages: userProfile.languages?.join(','),
        };
    }

    private fromUserProfileDB(userProfile: UserProfileDB): UserProfile {
        const res = {
            ...userProfile,
            pictures: [
                userProfile.picture1,
                userProfile.picture2,
                userProfile.picture3,
                userProfile.picture4,
                userProfile.picture5,
                userProfile.picture6,
            ].filter((picture): picture is string => !!picture),
            interests: userProfile.interests?.split(',') ?? [],
            associations: userProfile.associations?.split(',') ?? [],
            languages: userProfile.languages?.split(',') ?? [],
        };

        delete res.picture1;
        delete res.picture2;
        delete res.picture3;
        delete res.picture4;
        delete res.picture5;
        delete res.picture6;

        return res;
    }

    private isUserProfileReady(userProfile: UserProfile): boolean {
        return (
            (userProfile.name ?? '').length > 2 &&
            (userProfile.age ?? 0) > 0 &&
            (userProfile.bio ?? '').length > 0 &&
            (userProfile.pictures ?? []).length > 0
        );
    }

    private validateUserProfile(userProfile: UserProfile): void {
        if (
            userProfile.associations &&
            !userProfile.associations
                .filter((association) => association && association.length > 0)
                .every((association) =>
                    ASSOCIATIONS.find((a) => a === association),
                )
        ) {
            throw new HttpException(
                'Invalid association',
                StatusCodes.BAD_REQUEST,
            );
        }

        if (
            userProfile.interests &&
            !userProfile.interests
                .filter((interest) => interest && interest.length > 0)
                .every((interest) => INTERESTS.find((i) => i === interest))
        ) {
            throw new HttpException(
                'Invalid interest',
                StatusCodes.BAD_REQUEST,
            );
        }

        if (
            userProfile.drinking &&
            !DRINKING_HABITS.find((d) => d.id === userProfile.drinking)
        ) {
            throw new HttpException(
                'Invalid drinking habit',
                StatusCodes.BAD_REQUEST,
            );
        }

        if (
            userProfile.smoking &&
            !SMOKING_HABITS.find((s) => s.id === userProfile.smoking)
        ) {
            throw new HttpException(
                'Invalid smoking habit',
                StatusCodes.BAD_REQUEST,
            );
        }

        if (
            userProfile.usertype &&
            !USER_TYPE.find((s) => s.id === userProfile.usertype)
        ) {
            throw new HttpException(
                'Invalid usertype',
                StatusCodes.BAD_REQUEST,
            );
        }

        if (
            userProfile.drugs &&
            !DRUGS_HABITS.find((d) => d.id === userProfile.drugs)
        ) {
            throw new HttpException(
                'Invalid drugs habit',
                StatusCodes.BAD_REQUEST,
            );
        }
        if (
            userProfile.program &&
            !PROGRAMS_ARRAY.find((p) => p.id === userProfile.program)
        ) {
            throw new HttpException('Invalid program', StatusCodes.BAD_REQUEST);
        }

        if (
            userProfile.zodiacSign &&
            !ZODIAC_SIGNS.find((z) => z.id === userProfile.zodiacSign)
        ) {
            throw new HttpException(
                'Invalid zodiac sign',
                StatusCodes.BAD_REQUEST,
            );
        }
    }
}
