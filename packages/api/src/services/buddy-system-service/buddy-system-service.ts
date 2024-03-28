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

@singleton()
export class BuddySystemService {
    constructor(private readonly databaseService: DatabaseService) {}

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

        const matches: BuddySystemEventMatchUser[] =
            await this.buddySystemEventMatch
                .select([
                    'userProfiles.name',
                    'userProfiles.bio',
                    db.raw('userProfiles.picture1 as picture'),
                    'userProfiles.userId',
                ])
                .innerJoin(
                    'userProfiles',
                    'buddySystemEventMatch.userId1',
                    'userProfiles.userId',
                )
                .where('buddySystemEventId', buddySystemEventId)
                .andWhere(function () {
                    this.where('userId1', db.raw('?', [userId])).orWhere(
                        'userId2',
                        db.raw('?', [userId]),
                    );
                })
                .andWhere('userProfiles.userId', '!=', db.raw('?', [userId]));

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
        return this.buddySystemEventParticipant
            .select(['*'])
            .innerJoin(
                'user',
                'user.userId',
                'buddySystemEventParticipant.userId',
            )
            .innerJoin(
                'userProfile',
                'userProfile.userId',
                'buddySystemEventParticipant.userId',
            )
            .where('buddySystemEventId', buddySystemEventId);
    }
}
