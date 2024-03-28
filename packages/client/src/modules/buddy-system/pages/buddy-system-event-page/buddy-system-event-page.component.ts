import { Component } from '@angular/core';
import {
    BuddySystemEventExtended,
    BuddySystemEventFull,
} from 'common/models/buddy-system';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import { BuddySystemService } from '../../services/buddy-system.service';
import { ActivatedRoute } from '@angular/router';
import { toRelativeDateString } from 'src/modules/matching/utils/date';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-buddy-system-event-page',
    templateUrl: './buddy-system-event-page.component.html',
    styleUrls: ['./buddy-system-event-page.component.scss'],
})
export class BuddySystemEventPageComponent {
    event: Observable<BuddySystemEventExtended | undefined>;
    eventFull: BehaviorSubject<BuddySystemEventFull | undefined> =
        new BehaviorSubject<BuddySystemEventFull | undefined>(undefined);
    isNewStudentField = new FormControl<boolean>(false);

    constructor(
        private readonly buddySystemService: BuddySystemService,
        private readonly activeRoute: ActivatedRoute,
        private readonly snackbar: MatSnackBar,
    ) {
        this.event = this.activeRoute.paramMap.pipe(
            switchMap((params) => {
                return this.buddySystemService.getBuddySystemEvent(
                    Number(params.get('eventId')),
                );
            }),
        );
        this.event.subscribe((event) => {
            if (!event) return;
            this.buddySystemService
                .fetchFullBuddySystemEvent(event.buddySystemEventId)
                .subscribe((eventFull) => {
                    this.eventFull.next(eventFull);
                });
        });
        this.buddySystemService.updateBuddySystemEvents();
    }

    getFormattedDate(date: Date): string {
        return toRelativeDateString(date);
    }

    isCompleted() {
        return this.event.pipe(
            map(
                (event) =>
                    (event?.eventDate ?? Number.MAX_SAFE_INTEGER) < new Date(),
            ),
        );
    }

    participate(eventId: number, isNewStudent: boolean) {
        this.buddySystemService
            .participateInBuddySystemEvent(eventId, isNewStudent)
            .subscribe({
                next: () => {
                    this.eventFull.next(undefined);
                    this.buddySystemService
                        .fetchFullBuddySystemEvent(eventId)
                        .subscribe((eventFull) => {
                            this.eventFull.next(eventFull);
                        });
                },
                error: () => {
                    this.snackbar.open(
                        'Erreur lors de la participation',
                        'OK',
                        { duration: 3000 },
                    );
                },
            });
    }

    cancelParticipate(eventId: number) {
        this.buddySystemService
            .cancelParticipationInBuddySystemEvent(eventId)
            .subscribe({
                next: () => {
                    this.eventFull.next(undefined);
                    this.buddySystemService
                        .fetchFullBuddySystemEvent(eventId)
                        .subscribe((eventFull) => {
                            this.eventFull.next(eventFull);
                        });
                },
                error: () => {
                    this.snackbar.open(
                        "Erreur lors de l'annulation de la participation",
                        'OK',
                        { duration: 3000 },
                    );
                },
            });
    }
}
