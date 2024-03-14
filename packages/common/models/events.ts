export const EVENT_PATTERNS = ['none', 'weekly', 'monthly'];

export type EventPattern = typeof EVENT_PATTERNS[number];

export interface Event {
    eventId: number;
    userId: number;
    eventName: string;
    eventDescription: string;
    eventLocation: string;
    eventCategory: string;
    eventPicture: string;
    repeatPattern: EventPattern;
    eventDateStart: Date;
    eventDateEnd: Date;
    created_at: Date;
    updated_at: Date;
}

export type EventCreation = Omit<Event, 'eventId' | 'created_at' | 'updated_at' | 'eventDateEnd' | 'repeatPattern'> & Partial<Pick<Event, 'eventDateEnd' | 'repeatPattern'>>;

export interface EventParticipant {
    eventId: number;
    userId: number;
    response: string;
    created_at: Date;
    updated_at: Date;
}
