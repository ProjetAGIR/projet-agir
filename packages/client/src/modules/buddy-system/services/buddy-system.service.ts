import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    combineLatest,
    map,
    switchMap,
    tap,
} from 'rxjs';
import { SessionService } from 'src/modules/authentication/services/session-service/session.service';
import { ValidationService } from 'src/modules/validation/services/validation.service';
import {
    BuddySystemEvent,
    BuddySystemEventExtended,
    BuddySystemEventFull,
} from 'common/models/buddy-system';

@Injectable({
    providedIn: 'root',
})
export class BuddySystemService {
    private buddySystemEvents$: BehaviorSubject<
        Record<number, BuddySystemEventExtended>
    > = new BehaviorSubject<Record<number, BuddySystemEventExtended>>({});
    private loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    );

    constructor(
        private readonly http: HttpClient,
        private readonly sessionService: SessionService,
        private readonly validationService: ValidationService,
    ) {
        this.updateBuddySystemEvents().subscribe();
    }

    get buddySystemEvents(): Observable<BuddySystemEventExtended[]> {
        return this.buddySystemEvents$.asObservable().pipe(
            map((events) => Object.values(events)),
            map((events) =>
                events.sort(
                    (a, b) => a.eventDate.getTime() - b.eventDate.getTime(),
                ),
            ),
        );
    }

    get buddySystemEventsUpcoming(): Observable<BuddySystemEventExtended[]> {
        return this.buddySystemEvents.pipe(
            map((events) =>
                events.filter((event) => event.eventDate >= new Date()),
            ),
        );
    }

    get buddySystemEventsPast(): Observable<BuddySystemEventExtended[]> {
        return this.buddySystemEvents.pipe(
            map((events) =>
                events
                    .filter((event) => event.eventDate < new Date())
                    .reverse(),
            ),
        );
    }

    get loaded(): Observable<boolean> {
        return this.loaded$.asObservable();
    }

    getBuddySystemEvent(
        eventId: number,
    ): Observable<BuddySystemEventExtended | undefined> {
        return this.buddySystemEvents$.pipe(map((events) => events[eventId]));
    }

    updateBuddySystemEvents(): Observable<BuddySystemEvent[]> {
        return combineLatest([
            this.sessionService.isLoggedIn(),
            this.validationService.userValid,
        ]).pipe(
            switchMap(([isLoggedIn, userValid]) => {
                if (isLoggedIn && userValid) {
                    return this.fetchBuddySystemEvents();
                } else {
                    this.buddySystemEvents$.next([]);
                    return [];
                }
            }),
        );
    }

    fetchFullBuddySystemEvent(
        eventId: number,
    ): Observable<BuddySystemEventFull> {
        return this.http.get<BuddySystemEventFull>(`/buddy-system/${eventId}`);
    }

    participateInBuddySystemEvent(
        eventId: number,
        isNewStudent: boolean,
    ): Observable<void> {
        const events = this.buddySystemEvents$.value;
        events[eventId].isParticipating = true;
        this.buddySystemEvents$.next(events);

        return this.http
            .post<void>(`/buddy-system/participate/${eventId}`, {
                isNewStudent,
            })
            .pipe(
                tap({
                    next: () => {
                        const events = this.buddySystemEvents$.value;
                        events[eventId].isParticipating = true;
                        this.buddySystemEvents$.next(events);
                    },
                    error: () => {
                        const events = this.buddySystemEvents$.value;
                        events[eventId].isParticipating = false;
                        this.buddySystemEvents$.next(events);
                    },
                }),
            );
    }

    cancelParticipationInBuddySystemEvent(eventId: number): Observable<void> {
        const events = this.buddySystemEvents$.value;
        events[eventId].isParticipating = false;
        this.buddySystemEvents$.next(events);

        return this.http
            .delete<void>(`/buddy-system/participate/${eventId}`)
            .pipe(
                tap({
                    next: () => {
                        const events = this.buddySystemEvents$.value;
                        events[eventId].isParticipating = false;
                        this.buddySystemEvents$.next(events);
                    },
                    error: () => {
                        const events = this.buddySystemEvents$.value;
                        events[eventId].isParticipating = true;
                        this.buddySystemEvents$.next(events);
                    },
                }),
            );
    }

    private fetchBuddySystemEvents(): Observable<BuddySystemEvent[]> {
        return this.http.get<BuddySystemEventExtended[]>('/buddy-system').pipe(
            map((events) => {
                const eventsMap: Record<number, BuddySystemEventExtended> = {};
                events.forEach((event) => {
                    event.eventDate = new Date(event.eventDate);
                    event.createdAt = new Date(event.createdAt);
                    eventsMap[event.buddySystemEventId] = event;
                });
                this.buddySystemEvents$.next(eventsMap);
                this.loaded$.next(true);
                return events;
            }),
        );
    }
}
