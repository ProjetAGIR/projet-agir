import { Knex } from 'knex';
import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { Match, Swipe } from 'common/models/matching';
import { WsService } from '../ws-service/ws-service';
import { ModerationService } from '../moderation-service/moderation-service';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from '../notification-service/notification-service';
import { UserProfileService } from '../user-profile-service/user-profile-service';

@singleton()
export class MatchingService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly userProfileService: UserProfileService,
        private readonly wsService: WsService,
        private readonly moderationService: ModerationService,
        private readonly notificationService: NotificationService,
    ) {}

    private get matches(): Knex.QueryBuilder<Match> {
        return this.databaseService.database<Match>('matches');
    }

    private get swipes(): Knex.QueryBuilder<Swipe> {
        return this.databaseService.database<Swipe>('swipes');
    }

    /**
     * Like or dislike a user. Triggers a match if needed.
     *
     * @param activeUserId ID of the user who is swiping
     * @param targetUserId ID of the user who is being swiped
     * @param liked Whether or not the user was liked
     */
    async swipeUser(
        activeUserId: number,
        targetUserId: number,
        liked: boolean,
    ): Promise<void> {
        // const targetUserId = await this.userAliasService.getUserId(
        //     targetUserAliasId,
        // );
        if (await this.moderationService.isBannedOrSuspended(activeUserId)) {
            throw new HttpException(
                'You are banned or suspended',
                StatusCodes.LOCKED,
            );
        }
        if (await this.moderationService.isBannedOrSuspended(targetUserId)) {
            throw new HttpException(
                'You cannot interact with a user who is banned or suspended',
                StatusCodes.LOCKED,
            );
        }

        await this.swipes.insert({
            activeUserId,
            targetUserId,
            liked,
        });

        // Check if the target user has the "Automatically connect" feature enabled
        const autoConnectEnabled = (
            await this.userProfileService.getUserProfile(targetUserId)
        ).automaticallyConnect;

        if (liked) {
            const hasMutualLike = await this.swipes
                .select()
                .where({
                    activeUserId: targetUserId,
                    targetUserId: activeUserId,
                    liked: true,
                })
                .first();

            if (hasMutualLike || autoConnectEnabled) {
                await this.matchUsers(activeUserId, targetUserId);
            }
        }
    }

    /**
     * Unmatch a user
     *
     * @param userId ID of the user who is unmatching
     * @param unmatchedUserId ID of the user who is being unmatched
     */
    async unmatchUser(userId: number, unmatchedUserId: number): Promise<void> {
        await this.matches
            .update({
                unmatched: true,
                unmatchedUserId,
                unmatchedTime: new Date(),
            })
            .where({
                user1Id: userId,
                user2Id: unmatchedUserId,
            })
            .orWhere({
                user1Id: unmatchedUserId,
                user2Id: userId,
            });

        this.wsService.emitToUserIfConnected(
            unmatchedUserId,
            'match:update-list',
            {},
        );
    }

    /**
     * Check if two user are matched
     *
     * @param userId ID of the first user
     * @param targetUserId ID of the second user
     * @returns Whether or not the users are matched
     */
    async areMatched(userId: number, targetUserId: number): Promise<boolean> {
        return !!(await this.matches
            .select()
            .where({
                user1Id: userId,
                user2Id: targetUserId,
                unmatched: false,
            })
            .orWhere({
                user1Id: targetUserId,
                user2Id: userId,
                unmatched: false,
            })
            .first());
    }

    async matchUsers(
        activeUserId: number,
        targetUserId: number,
    ): Promise<void> {
        if (await this.moderationService.isBannedOrSuspended(activeUserId)) {
            throw new HttpException(
                'You are banned or suspended',
                StatusCodes.LOCKED,
            );
        }
        if (await this.moderationService.isBannedOrSuspended(targetUserId)) {
            throw new HttpException(
                'You cannot interact with a user who is banned or suspended',
                StatusCodes.LOCKED,
            );
        }

        await this.matches.insert({
            user1Id: activeUserId,
            user2Id: targetUserId,
        });

        const activeUser = await this.userProfileService.getUserProfile(
            activeUserId,
        );
        const targetUser = await this.userProfileService.getUserProfile(
            activeUserId,
        );

        this.notificationService.notifyUser(
            activeUserId,
            'matches',
            `Nouvelle connexion avec ${targetUser.name} !`,
        );
        this.notificationService.notifyUser(
            targetUserId,
            'matches',
            `Nouvelle connexion avec ${activeUser.name} !`,
        );

        this.wsService.emitToUserIfConnected(
            activeUserId,
            'match:matched-active',
            {
                matchedUserId: targetUserId,
            },
        );
        this.wsService.emitToUserIfConnected(
            targetUserId,
            'match:matched-passive',
            {
                matchedUserId: activeUserId,
            },
        );
        this.wsService.emitToUserIfConnected(
            targetUserId,
            'match:update-list',
            {},
        );
    }
}
