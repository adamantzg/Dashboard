import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentsStatusWidgetComponent } from './agents-status-widget.component';

describe('AgentsStatusWidgetComponent', () => {
  let component: AgentsStatusWidgetComponent;
  let fixture: ComponentFixture<AgentsStatusWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentsStatusWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentsStatusWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
