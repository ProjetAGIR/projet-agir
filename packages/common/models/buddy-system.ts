import { User, UserProfile } from "./user";

export interface BuddySystemEvent {
    buddySystemEventId: number;
    eventDate: Date;
    name: string;
    description: string;
    isCompleted: boolean;
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

export interface BuddySystemEventMatchUser {
    name: string;
    bio: string;
    picture: string;
    userId: number;
}

export interface BuddySystemEventExtended extends BuddySystemEvent {
    isParticipating: boolean;
    matchesCount: number;
}

export interface BuddySystemEventFull extends BuddySystemEvent {
    matches: BuddySystemEventMatchUser[];
    participation?: BuddySystemEventParticipant;
}

export type BuddySystemEventParticipantExtended = BuddySystemEventParticipant & User & UserProfile

export type BuddySystemEventCreation = Omit<BuddySystemEvent, 'buddySystemEventId' | 'createdAt' | 'isCompleted'>;

export type BuddySystemEventParticipantCreation = Omit<BuddySystemEventParticipant, 'createdAt'>;