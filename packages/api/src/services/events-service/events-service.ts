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

    async createEvent(event: EventCreation): Promise<EventExtended> {
        this.validateEvent(event);

        const [createdEvent]: number[] = await this.events.insert({
            ...event,
            eventDateStart: new Date(event.eventDateStart),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            eventDateEnd: new Date(event.eventDateEnd!),
        });

        return this.getEvent(
            createdEvent,
            event.userId,
        ) as Promise<EventExtended>;
    }

    async updateEvent(
        userId: number,
        eventId: number,
        event: EventCreation,
    ): Promise<EventExtended> {
        this.validateEvent(event);

        await this.events.where('eventId', eventId).update({
            ...event,
            eventDateStart: event.eventDateStart
                ? new Date(event.eventDateStart)
                : undefined,
            eventDateEnd: event.eventDateEnd
                ? new Date(event.eventDateEnd)
                : undefined,
        });

        return this.getEvent(eventId, userId) as Promise<EventExtended>;
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

    private validateEvent(
        event: EventCreation,
    ): event is Omit<EventCreation, 'eventDateEnd'> & { eventDateEnd: Date } {
        if (!event.eventName) {
            throw new Error('Event name is required');
        }

        if (!event.eventDescription) {
            throw new Error('Event description is required');
        }

        if (!event.eventLocation) {
            throw new Error('Event location is required');
        }

        if (!event.eventCategory) {
            throw new Error('Event category is required');
        }

        if (!event.eventDateStart) {
            throw new Error('Event start date is required');
        }

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

        return true;
    }
}
