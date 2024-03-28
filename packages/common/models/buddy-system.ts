import { User, UserProfile } from "./user";

export interface BuddySystemEvent {
    buddySystemEventId: number;
    eventDate: Date;
    name: string;
    description: string;
    createdAt: Date;
}

export interface BuddySystemEventParticipant {
    buddySystemEventId: number;
    userId: number;
    isNewStudent: boolean;
    createdAt: Date;
}

export interface BuddySystemEventMatch {
    buddySystemEventId: number;
    userId1: number;
    userId2: number;
}

export type BuddySystemEventParticipantExtended = BuddySystemEventParticipant & User & UserProfile

export type BuddySystemEventCreation = Omit<BuddySystemEvent, 'buddySystemEventId' | 'createdAt'>;

export type BuddySystemEventParticipantCreation = Omit<BuddySystemEventParticipant, 'createdAt'>;