import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { Knex } from 'knex';
import {
    BuddySystemEvent,
    BuddySystemEventCreation,
    BuddySystemEventMatch,
    BuddySystemEventParticipant,
    BuddySystemEventParticipantCreation,
    BuddySystemEventParticipantExtended,
} from 'common/models/buddy-system';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';

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
    ): Promise<BuddySystemEvent | undefined> {
        const [event] = await this.buddySystemEvent
            .select(['*'])
            .where('buddySystemEventId', buddySystemEventId)
            .orderBy('eventDate', 'desc');

        return event;
    }

    async getBuddySystemEvents(): Promise<BuddySystemEvent[]> {
        return this.buddySystemEvent.select(['*']).orderBy('eventDate', 'desc');
    }

    async createBuddySystemEvent(
        event: BuddySystemEventCreation,
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

        return this.getBuddySystemEvent(
            buddySystemEventId,
        ) as Promise<BuddySystemEvent>;
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
