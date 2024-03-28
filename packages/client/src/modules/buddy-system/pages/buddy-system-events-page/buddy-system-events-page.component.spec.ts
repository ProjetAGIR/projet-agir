import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuddySystemEventsPageComponent } from './buddy-system-events-page.component';

describe('BuddySystemEventsPageComponent', () => {
    let component: BuddySystemEventsPageComponent;
    let fixture: ComponentFixture<BuddySystemEventsPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BuddySystemEventsPageComponent],
        });
        fixture = TestBed.createComponent(BuddySystemEventsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
