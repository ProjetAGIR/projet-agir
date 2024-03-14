import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { Knex } from 'knex';
import { EVENT_PATTERNS, Event, EventCreation } from 'common/models/events';
import { DBQuery, DEFAULT_DB_QUERY } from 'common/models/db-query';

@singleton()
export class EventsService {
    constructor(private readonly databaseService: DatabaseService) {}

    private get events(): Knex.QueryBuilder<Event> {
        return this.databaseService.database<Event>('events');
    }

    async getUpcomingEvents(query: Partial<DBQuery> = {}): Promise<Event[]> {
        const completeQuery = { ...DEFAULT_DB_QUERY, ...query };

        return this.events
            .where('eventDateStart', '>', new Date())
            .limit(completeQuery.limit)
            .offset(completeQuery.offset)
            .orderBy('eventDateStart', 'asc');
    }

    async getUpcomingEventsByUser(
        userId: number,
        query: Partial<DBQuery>,
    ): Promise<Event[]> {
        const completeQuery = { ...DEFAULT_DB_QUERY, ...query };

        return this.events
            .where('userId', userId)
            .where('eventDateStart', '>', new Date())
            .limit(completeQuery.limit)
            .offset(completeQuery.offset)
            .orderBy('eventDateStart', 'asc');
    }

    async createEvent(event: EventCreation): Promise<Event> {
        if (!event.eventDateEnd) {
            event.eventDateEnd = event.eventDateStart;
        }

        if (event.eventDateEnd < event.eventDateStart) {
            throw new Error('Event end date must be after start date');
        }

        if (event.repeatPattern) {
            if (!EVENT_PATTERNS.includes(event.repeatPattern)) {
                throw new Error(
                    `Invalid event repeat pattern. Found "${
                        event.repeatPattern
                    }", expected one of ${EVENT_PATTERNS.join(', ')}`,
                );
            }
        } else {
            event.repeatPattern = 'none';
        }

        const [createdEvent] = await this.events.insert(event).returning('*');

        return createdEvent;
    }
}
