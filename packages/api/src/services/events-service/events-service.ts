import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { Knex } from 'knex';
import {
    EVENT_PATTERNS,
    EVENT_RESPONSE,
    Event,
    EventCreation,
    EventExtended,
    EventResponse,
} from 'common/models/events';
import { DBQuery, DEFAULT_DB_QUERY } from 'common/models/db-query';

@singleton()
export class EventsService {
    constructor(private readonly databaseService: DatabaseService) {}

    private get events(): Knex.QueryBuilder<Event> {
        return this.databaseService.database<Event>('events');
    }

    async getEvent(
        eventId: number,
        userId: number,
    ): Promise<EventExtended | undefined> {
        const db = this.databaseService.database;

        const [event] = await this.events
            .select([
                'events.*',
                'userProfiles.name as organizerName',
                'userProfiles.picture1 as organizerPicture',
                db.raw(
                    'count(case when eventParticipants.response = "interested" then 1 end) as interestedParticipants',
                ),
                db.raw(
                    'count(case when eventParticipants.response = "going" then 1 end) as goingParticipants',
                ),
                'userResponse.response',
            ])
            .innerJoin('userProfiles', 'events.userId', 'userProfiles.userId')
            .leftJoin(
                'eventParticipants',
                'events.eventId',
                'eventParticipants.eventId',
            )
            .leftJoin('eventParticipants as userResponse', function () {
                this.on('events.eventId', 'userResponse.eventId').andOn(
                    'userResponse.userId',
                    db.raw('?', [userId]),
                );
            })
            .where('events.eventId', eventId)
            .groupBy('events.eventId');

        return event;
    }

    async getUpcomingEvents(
        userId: number,
        query: Partial<DBQuery> = {},
    ): Promise<EventExtended[]> {
        const completeQuery = { ...DEFAULT_DB_QUERY, ...query };
        const db = this.databaseService.database;

        return this.events
            .select([
                'events.*',
                'userProfiles.name as organizerName',
                'userProfiles.picture1 as organizerPicture',
                'userResponse.response',
                db.raw(
                    'count(case when eventParticipants.response = "interested" then 1 end) as interestedParticipants',
                ),
                db.raw(
                    'count(case when eventParticipants.response = "going" then 1 end) as goingParticipants',
                ),
            ])
            .innerJoin('userProfiles', 'events.userId', 'userProfiles.userId')
            .leftJoin(
                'eventParticipants',
                'events.eventId',
                'eventParticipants.eventId',
            )
            .leftJoin('eventParticipants as userResponse', function () {
                this.on('events.eventId', 'userResponse.eventId').andOn(
                    'userResponse.userId',
                    db.raw('?', [userId]),
                );
            })
            .where('eventDateStart', '>', new Date())
            .groupBy('events.eventId')
            .limit(completeQuery.limit)
            .offset(completeQuery.offset)
            .orderBy('eventDateStart', 'asc');
    }

    async getUpcomingEventsForUser(
        userId: number,
        query: Partial<DBQuery>,
    ): Promise<EventExtended[]> {
        const completeQuery = { ...DEFAULT_DB_QUERY, ...query };
        const db = this.databaseService.database;

        return this.events
            .select([
                'events.*',
                'userProfiles.name as organizerName',
                'userProfiles.picture1 as organizerPicture',
                'userResponse.response',
                this.databaseService.database.raw(
                    'count(case when eventParticipants.response = "interested" then 1 end) as interestedParticipants',
                ),
                this.databaseService.database.raw(
                    'count(case when eventParticipants.response = "going" then 1 end) as goingParticipants',
                ),
            ])
            .innerJoin('userProfiles', 'events.userId', 'userProfiles.userId')
            .leftJoin(
                'eventParticipants',
                'events.eventId',
                'eventParticipants.eventId',
            )
            .leftJoin('eventParticipants as userResponse', function () {
                this.on('events.eventId', 'userResponse.eventId').andOn(
                    'userResponse.userId',
                    db.raw('?', [userId]),
                );
            })
            .where('events.userId', userId)
            .where('eventDateStart', '>', new Date())
            .groupBy('events.eventId')
            .limit(completeQuery.limit)
            .offset(completeQuery.offset)
            .orderBy('eventDateStart', 'asc');
    }

    async getUpcomingEventsByUser(
        userId: number,
        query: Partial<DBQuery>,
    ): Promise<EventExtended[]> {
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

    async respondToEvent(
        userId: number,
        eventId: number,
        response: EventResponse,
    ): Promise<EventCreation> {
        if (!EVENT_RESPONSE.includes(response)) {
            throw new Error(
                `Invalid event response. Found "${response}", expected one of ${EVENT_RESPONSE.join(
                    ', ',
                )}`,
            );
        }

        await this.databaseService
            .database('eventParticipants')
            .insert({
                userId,
                eventId,
                response,
            })
            .onConflict(['userId', 'eventId'])
            .merge({
                response,
            });

        return this.getEvent(eventId, userId) as Promise<EventExtended>;
    }
}
