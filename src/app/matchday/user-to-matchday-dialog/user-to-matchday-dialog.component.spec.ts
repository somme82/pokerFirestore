import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserToMatchdayDialogComponent } from './user-to-matchday-dialog.component';

describe('UserToMatchdayDialogComponent', () => {
  let component: UserToMatchdayDialogComponent;
  let fixture: ComponentFixture<UserToMatchdayDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserToMatchdayDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserToMatchdayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
