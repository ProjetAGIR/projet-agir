export const EVENT_PATTERNS = ['none', 'weekly', 'monthly'] as const;
export const EVENT_RESPONSE = ['going', 'interested', 'not going'] as const;

export type EventPattern = typeof EVENT_PATTERNS[number];
export type EventResponse = typeof EVENT_RESPONSE[number];

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

export type EventCreation = Omit<Event, 'eventId' | 'created_at' | 'updated_at' | 'eventDateEnd' | 'repeatPattern'> & Partial<Pick<Event, 'eventCategory' | 'eventDateEnd' | 'repeatPattern'>>;

export interface EventParticipant {
    eventId: number;
    userId: number;
    response: EventResponse;
    created_at: Date;
    updated_at: Date;
}

export interface EventExtended extends Event {
    organizerName: string;
    organizerPicture: string;
    interestedParticipants: number;
    goingParticipants: number;
    response: EventResponse;
}