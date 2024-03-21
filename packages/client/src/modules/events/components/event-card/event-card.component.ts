import { Component, Input } from '@angular/core';
import { EventExtended, EventResponse } from 'common/models/events';
import { toRelativeDateString } from 'src/modules/matching/utils/date';
import { EventsService } from '../../services/events.service';
import { Observable, catchError, map, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SessionService } from 'src/modules/authentication/services/session-service/session.service';

@Component({
    selector: 'app-event-card',
    templateUrl: './event-card.component.html',
    styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent {
    @Input() event!: EventExtended;
    @Input() display: 'full' | 'compact' = 'full';
    @Input() ownerCanEdit: boolean = true;

    constructor(
        private readonly eventsService: EventsService,
        private readonly snackBar: MatSnackBar,
        private readonly router: Router,
        private readonly sessionService: SessionService,
    ) {}

    getFormattedDate() {
        return toRelativeDateString(new Date(this.event.eventDateStart));
    }

    isNotGoing() {
        return this.event.response === 'not going' || !this.event.response;
    }

    isInterestedOrGoing() {
        return (
            this.event.response === 'interested' ||
            this.event.response === 'going'
        );
    }

    isGoing() {
        return this.event.response === 'going';
    }

    interestedOrGoingLabel() {
        return this.event.response === 'interested' ? 'Intéressé' : "J'y vais";
    }

    isOwner(): Observable<boolean> {
        return this.sessionService.session.pipe(
            map((session) => session?.user.userId === this.event.userId),
        );
    }

    handleResponse(event: Event, response: EventResponse) {
        event.stopImmediatePropagation();

        if (response === this.event.response) {
            return;
        }

        const previousResponse = this.event.response;
        this.event.response = response;

        this.eventsService
            .respondToEvent(this.event.eventId, response)
            .pipe(
                catchError(() => {
                    this.event.response = previousResponse;
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

    handleClick() {
        this.router.navigate(['/events', this.event.eventId]);
    }
}
