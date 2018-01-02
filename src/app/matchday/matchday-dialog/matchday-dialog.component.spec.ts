import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchdayDialogComponent } from './matchday-dialog.component';

describe('MatchdayDialogComponent', () => {
  let component: MatchdayDialogComponent;
  let fixture: ComponentFixture<MatchdayDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchdayDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchdayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
