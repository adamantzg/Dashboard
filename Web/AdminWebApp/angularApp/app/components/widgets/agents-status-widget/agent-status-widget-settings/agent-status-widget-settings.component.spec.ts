import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentStatusWidgetSettingsComponent } from './agent-status-widget-settings.component';

describe('AgentStatusWidgetSettingsComponent', () => {
  let component: AgentStatusWidgetSettingsComponent;
  let fixture: ComponentFixture<AgentStatusWidgetSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentStatusWidgetSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentStatusWidgetSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
