import { Component } from '@angular/core';
import { BuddySystemEventExtended } from 'common/models/buddy-system';
import { Observable, switchMap } from 'rxjs';
import { BuddySystemService } from '../../services/buddy-system.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-buddy-system-event-page',
    templateUrl: './buddy-system-event-page.component.html',
    styleUrls: ['./buddy-system-event-page.component.scss'],
})
export class BuddySystemEventPageComponent {
    event: Observable<BuddySystemEventExtended | undefined>;

    constructor(
        private readonly buddySystemService: BuddySystemService,
        private readonly activeRoute: ActivatedRoute,
    ) {
        this.event = this.activeRoute.paramMap.pipe(
            switchMap((params) => {
                return this.buddySystemService.getBuddySystemEvent(
                    Number(params.get('eventId')),
                );
            }),
        );
        this.buddySystemService.updateBuddySystemEvents();
    }
}
