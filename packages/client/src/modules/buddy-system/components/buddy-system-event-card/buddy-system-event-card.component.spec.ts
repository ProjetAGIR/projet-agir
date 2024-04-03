import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuddySystemEventCardComponent } from './buddy-system-event-card.component';

describe('BuddySystemEventCardComponent', () => {
    let component: BuddySystemEventCardComponent;
    let fixture: ComponentFixture<BuddySystemEventCardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BuddySystemEventCardComponent],
        });
        fixture = TestBed.createComponent(BuddySystemEventCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
