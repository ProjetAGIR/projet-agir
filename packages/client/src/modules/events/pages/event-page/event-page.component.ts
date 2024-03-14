import { Component } from '@angular/core';
import { EventsService } from '../../services/events.service';
import { ValidationService } from 'src/modules/validation/services/validation.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, catchError, combineLatest, of, switchMap } from 'rxjs';
import { EventExtended, EventResponse } from 'common/models/events';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toRelativeDateString } from 'src/modules/matching/utils/date';

@Component({
    selector: 'app-event-page',
    templateUrl: './event-page.component.html',
    styleUrls: ['./event-page.component.scss'],
})
export class EventPageComponent {
    event$: Observable<EventExtended | undefined>;

    constructor(
        private readonly eventsService: EventsService,
        private readonly validationService: ValidationService,
        private readonly activeRoute: ActivatedRoute,
        private readonly snackBar: MatSnackBar,
    ) {
        this.event$ = combineLatest([
            this.validationService.userValid,
            this.activeRoute.paramMap,
        ]).pipe(
            switchMap(([userValid, params]) => {
                const eventId = params.get('eventId');

                if (userValid && eventId) {
                    return this.eventsService.getEvent(Number(eventId));
                }

                return of(undefined);
            }),
        );
    }

    isThisMonth(date: Date) {
        const now = new Date();
        return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );
    }

    getMonth(date: Date) {
        return date.toLocaleString('fr-FR', { month: 'long' });
    }

    getDateStr(start: Date, end: Date) {
        if (start.getTime() === end.getTime()) {
            return toRelativeDateString(start);
        } else if (start.toDateString() === end.toDateString()) {
            return `Le ${start.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
            })} de ${start.toLocaleTimeString('fr-FR', {
                hour: 'numeric',
                minute: 'numeric',
            })} à ${end.toLocaleTimeString('fr-FR', {
                hour: 'numeric',
                minute: 'numeric',
            })}`;
        } else {
            return `Du ${start.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
            })} au ${end.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
            })}`;
        }
    }

    handleResponse(
        htmlEvent: Event,
        event: EventExtended,
        response: EventResponse,
    ) {
        htmlEvent.stopImmediatePropagation();

        if (response === event.response) {
            return;
        }

        const previousResponse = event.response;
        event.response = response;

        this.eventsService
            .respondToEvent(event.eventId, response)
            .pipe(
                catchError(() => {
                    event.response = previousResponse;
                    this.snackBar.open(
                        'Impossible de changer la réponse',
                        'OK',
                        { duration: 3000 },
                    );

                    return of(undefined);
                }),
            )
            .subscribe();
    }
}
