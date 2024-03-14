import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, tap } from 'rxjs';
import { EventExtended, EventResponse } from 'common/models/events';
import { HttpClient } from '@angular/common/http';
import { SessionService } from 'src/modules/authentication/services/session-service/session.service';
import { ValidationService } from 'src/modules/validation/services/validation.service';

@Injectable({
    providedIn: 'root',
})
export class EventsService {
    private upcomingEvents$: BehaviorSubject<Record<number, EventExtended>> =
        new BehaviorSubject<Record<number, EventExtended>>({});
    private loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    );

    constructor(
        private readonly http: HttpClient,
        private readonly sessionService: SessionService,
        private readonly validationService: ValidationService,
    ) {
        combineLatest([
            this.sessionService.isLoggedIn(),
            this.validationService.userValid,
        ]).subscribe(([isLoggedIn, userValid]) => {
            if (isLoggedIn && userValid) {
                this.fetchUpcomingEvents().subscribe();
            } else {
                this.upcomingEvents$.next([]);
            }
        });
    }

    get upcomingEvents(): Observable<EventExtended[]> {
        return this.upcomingEvents$.asObservable().pipe(
            map((events) => Object.values(events)),
            map((events) =>
                events.sort(
                    (a, b) =>
                        a.eventDateStart.getTime() - b.eventDateStart.getTime(),
                ),
            ),
        );
    }

    get loaded(): Observable<boolean> {
        return this.loaded$.asObservable();
    }

    getEvent(eventId: number): Observable<EventExtended | undefined> {
        return this.upcomingEvents$.pipe(map((events) => events[eventId]));
    }

    fetchUpcomingEvents(): Observable<EventExtended[]> {
        return this.http.get<EventExtended[]>('/events').pipe(
            tap((events) => {
                this.loaded$.next(true);
                this.upcomingEvents$.next(
                    events.reduce(
                        (acc, event) => {
                            event.eventDateStart = new Date(
                                event.eventDateStart,
                            );
                            event.eventDateEnd = new Date(event.eventDateEnd);

                            acc[event.eventId] = event;
                            return acc;
                        },
                        {} as Record<number, EventExtended>,
                    ),
                );
            }),
        );
    }

    respondToEvent(
        eventId: number,
        response: EventResponse,
    ): Observable<EventExtended> {
        return this.http
            .post<EventExtended>(`/events/${eventId}/response`, { response })
            .pipe(
                tap((event) => {
                    event.eventDateStart = new Date(event.eventDateStart);
                    event.eventDateEnd = new Date(event.eventDateEnd);

                    const updatedEvents = this.upcomingEvents$.getValue();
                    updatedEvents[event.eventId] = { ...event, response };
                    this.upcomingEvents$.next(updatedEvents);
                }),
            );
    }
}
