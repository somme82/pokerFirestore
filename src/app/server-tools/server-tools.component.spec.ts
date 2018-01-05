import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerToolsComponent } from './server-tools.component';

describe('ServerToolsComponent', () => {
  let component: ServerToolsComponent;
  let fixture: ComponentFixture<ServerToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerToolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
