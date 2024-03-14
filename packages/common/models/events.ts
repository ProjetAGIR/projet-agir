export interface Event {
    eventId: number;
    userId: number;
    eventName: string;
    eventDescription: string;
    eventLocation: string;
    eventCategory: string;
    eventPicture: string;
    repeatPattern: string;
    eventDateStart: Date;
    eventDateEnd: Date;
    created_at: Date;
    updated_at: Date;
}

export interface EventParticipant {
    eventId: number;
    userId: number;
    response: string;
    created_at: Date;
    updated_at: Date;
}