import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuddySystemEventPageComponent } from './buddy-system-event-page.component';

describe('BuddySystemEventPageComponent', () => {
  let component: BuddySystemEventPageComponent;
  let fixture: ComponentFixture<BuddySystemEventPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuddySystemEventPageComponent]
    });
    fixture = TestBed.createComponent(BuddySystemEventPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
