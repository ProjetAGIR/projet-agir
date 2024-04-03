import { Component } from '@angular/core';
import { BuddySystemEventExtended } from 'common/models/buddy-system';
import { Observable } from 'rxjs';
import { BuddySystemService } from '../../services/buddy-system.service';

@Component({
    selector: 'app-buddy-system-events-page',
    templateUrl: './buddy-system-events-page.component.html',
    styleUrls: ['./buddy-system-events-page.component.scss'],
})
export class BuddySystemEventsPageComponent {
    buddySystemEventsUpcoming: Observable<BuddySystemEventExtended[]>;
    buddySystemEventsPast: Observable<BuddySystemEventExtended[]>;
    loaded: Observable<boolean>;

    constructor(private readonly buddySystemService: BuddySystemService) {
        this.buddySystemEventsUpcoming =
            buddySystemService.buddySystemEventsUpcoming;
        this.buddySystemEventsPast = buddySystemService.buddySystemEventsPast;
        this.loaded = buddySystemService.loaded;

        buddySystemService.updateBuddySystemEvents().subscribe();
    }
}
