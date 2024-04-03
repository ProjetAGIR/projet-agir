import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { Knex } from 'knex';
import {
    BuddySystemEvent,
    BuddySystemEventCreation,
    BuddySystemEventExtended,
    BuddySystemEventFull,
    BuddySystemEventMatch,
    BuddySystemEventMatchUser,
    BuddySystemEventParticipant,
    BuddySystemEventParticipantCreation,
    BuddySystemEventParticipantExtended,
} from 'common/models/buddy-system';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { TypeOfId } from 'common/types/id';
import { User } from 'common/models/user';
import { CronJob } from 'cron';
import { BuddyPairing, toBuddyPairingUser } from '../../models/buddy-pairing';
import { logger } from '../../utils/logger';
import { MatchingService } from '../matching-service/matching-service';

@singleton()
export class BuddySystemService {
    private job: CronJob | undefined = undefined;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly matchingService: MatchingService,
    ) {}

    private get buddySystemEvent(): Knex.QueryBuilder<BuddySystemEvent> {
        return this.databaseService.database<BuddySystemEvent>(
            'buddySystemEvent',
        );
    }

    private get buddySystemEventParticipant(): Knex.QueryBuilder<BuddySystemEventParticipant> {
        return this.databaseService.database<BuddySystemEventParticipant>(
            'buddySystemEventParticipant',
        );
    }

    private get buddySystemEventMatch(): Knex.QueryBuilder<BuddySystemEventMatch> {
        return this.databaseService.database<BuddySystemEventMatch>(
            'buddySystemEventMatch',
        );
    }

    instantiate() {
        this.job = CronJob.from({
            cronTime: '*/10 * * * * *',
            onTick: async () => {
                await Promise.all(
                    (
                        await this.getEventsToPair()
                    ).map((event) =>
                        this.executeEventPairing(event.buddySystemEventId),
                    ),
                );
            },
            start: true,
            timeZone: 'Europe/Paris',
        });
    }

    async getBuddySystemEvent(
        buddySystemEventId: number,
        userId: TypeOfId<User>,
    ): Promise<BuddySystemEventFull> {
        const db = this.databaseService.database;
        const [event] = await this.buddySystemEvent
            .select(['*'])
            .where('buddySystemEventId', buddySystemEventId)
            .orderBy('eventDate', 'desc');

        if (!event) {
            throw new HttpException(
                `No buddy system event with ID ${buddySystemEventId}`,
                StatusCodes.NOT_FOUND,
            );
        }

        const [participation] = await this.buddySystemEventParticipant
            .select(['*'])
            .where('buddySystemEventId', buddySystemEventId)
            .andWhere('userId', db.raw('?', [userId]));

        const sql = this.buddySystemEventMatch
            .select([
                'userProfiles.name',
                'userProfiles.bio',
                db.raw('userProfiles.picture1 as picture'),
                'userProfiles.userId',
            ])
            .innerJoin('userProfiles', function () {
                this.on(
                    'buddySystemEventMatch.userId1',
                    'userProfiles.userId',
                ).orOn('buddySystemEventMatch.userId2', 'userProfiles.userId');
            })
            .where('buddySystemEventId', buddySystemEventId)
            .andWhere(function () {
                this.where('userId1', db.raw('?', [userId])).orWhere(
                    'userId2',
                    db.raw('?', [userId]),
                );
            })
            .andWhere(function () {
                this.where(
                    'userId1',
                    db.raw('`userProfiles`.`userId`'),
                ).orWhere('userId2', db.raw('`userProfiles`.`userId`'));
            })
            .andWhere('userProfiles.userId', '!=', db.raw('?', [userId]));

        const matches: BuddySystemEventMatchUser[] = await sql;

        return { ...event, participation, matches };
    }

    async getBuddySystemEvents(
        userId: TypeOfId<User>,
    ): Promise<BuddySystemEventExtended[]> {
        const db = this.databaseService.database;

        return this.buddySystemEvent
            .select([
                'buddySystemEvent.*',
                db.raw(
                    'count(buddySystemEventParticipant.userId) as isParticipating',
                ),
                db.raw('count(buddySystemEventMatch.userId1) as matchesCount'),
            ])
            .leftJoin('buddySystemEventParticipant', function () {
                this.on(
                    'buddySystemEvent.buddySystemEventId',
                    'buddySystemEventParticipant.buddySystemEventId',
                ).andOn(
                    'buddySystemEventParticipant.userId',
                    db.raw('?', [userId]),
                );
            })
            .leftJoin('buddySystemEventMatch', function () {
                this.on(
                    'buddySystemEvent.buddySystemEventId',
                    'buddySystemEventMatch.buddySystemEventId',
                ).andOn(function () {
                    this.on(
                        'buddySystemEventMatch.userId1',
                        db.raw('?', [userId]),
                    ).orOn(
                        'buddySystemEventMatch.userId2',
                        db.raw('?', [userId]),
                    );
                });
            })
            .groupBy('buddySystemEvent.buddySystemEventId')
            .orderBy('eventDate', 'desc');
    }

    async createBuddySystemEvent(
        event: BuddySystemEventCreation,
        userId: TypeOfId<User>,
    ): Promise<BuddySystemEvent> {
        const creationEvent: BuddySystemEventCreation = {
            eventDate: new Date(event.eventDate),
            name: event.name,
            description: event.description,
        };

        if (creationEvent.eventDate < new Date()) {
            throw new HttpException(
                'Event date must be in the future',
                StatusCodes.BAD_REQUEST,
            );
        }

        const [buddySystemEventId] = await this.buddySystemEvent.insert(
            creationEvent,
        );

        return this.getBuddySystemEvent(buddySystemEventId, userId);
    }

    async participateInBuddySystemEvent(
        participation: BuddySystemEventParticipantCreation,
    ): Promise<BuddySystemEventParticipant> {
        const [participant] = await this.buddySystemEventParticipant
            .insert({
                buddySystemEventId: participation.buddySystemEventId,
                userId: participation.userId,
                isNewStudent: Boolean(participation.isNewStudent),
            })
            .returning('*');

        return participant;
    }

    async removeParticipationInBuddySystemEvent(
        buddySystemEventId: number,
        userId: TypeOfId<User>,
    ): Promise<void> {
        await this.buddySystemEventParticipant
            .where({
                buddySystemEventId,
                userId,
            })
            .delete();
    }

    async getBuddySystemEventParticipants(
        buddySystemEventId: number,
    ): Promise<BuddySystemEventParticipantExtended[]> {
        return (
            await this.buddySystemEventParticipant
                .select(['*'])
                .innerJoin(
                    'users',
                    'users.userId',
                    'buddySystemEventParticipant.userId',
                )
                .innerJoin(
                    'userProfiles',
                    'userProfiles.userId',
                    'buddySystemEventParticipant.userId',
                )
                .where('buddySystemEventId', buddySystemEventId)
        ).map((participant: BuddySystemEventParticipantExtended) => ({
            ...participant,
            interests:
                (participant.interests as string | undefined)
                    ?.split(',')
                    .map((i) => i.trim()) ?? [],
            associations:
                (participant.associations as string | undefined)
                    ?.split(',')
                    .map((i) => i.trim()) ?? [],
            languages:
                (participant.languages as string | undefined)
                    ?.split(',')
                    .map((i) => i.trim()) ?? [],
        }));
    }

    private async getEventsToPair(): Promise<
        Pick<BuddySystemEvent, 'buddySystemEventId'>[]
    > {
        return this.buddySystemEvent
            .select(['buddySystemEventId'])
            .where('isCompleted', false)
            .andWhere('eventDate', '<', new Date());
    }

    private async executeEventPairing(buddySystemEventId: number) {
        logger.debug(`Starting pairing for event ${buddySystemEventId}`);

        const participants = await this.getBuddySystemEventParticipants(
            buddySystemEventId,
        );
        const [newUsers, mentors] = participants.reduce(
            ([newUsers, mentors], participant) => {
                if (participant.isNewStudent) {
                    return [newUsers.concat(participant), mentors];
                } else {
                    return [newUsers, mentors.concat(participant)];
                }
            },
            [[], []] as BuddySystemEventParticipantExtended[][],
        );

        if (newUsers.length === 0 || mentors.length === 0) {
            logger.warn(
                `Pairing for event ${buddySystemEventId} impossible: not enough participants (new: ${newUsers.length}, mentors: ${mentors.length})`,
            );
            return;
        }

        const pairing = new BuddyPairing(
            newUsers.map(toBuddyPairingUser),
            mentors.map(toBuddyPairingUser),
        );

        pairing.pair();

        await Promise.all(
            pairing.pairs
                .map((pair) => [
                    this.buddySystemEventMatch.insert({
                        buddySystemEventId,
                        userId1: pair.left.userId,
                        userId2: pair.right.userId,
                    }),
                    this.matchingService.matchUsers(
                        pair.left.userId,
                        pair.right.userId,
                    ),
                ])
                .flat(),
        );

        await this.buddySystemEvent
            .update({ isCompleted: true })
            .where('buddySystemEventId', buddySystemEventId);

        logger.debug(`Pairing for event ${buddySystemEventId} completed`);
    }
}
