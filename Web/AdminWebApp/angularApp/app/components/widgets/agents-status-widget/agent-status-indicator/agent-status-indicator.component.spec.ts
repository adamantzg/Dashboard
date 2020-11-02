import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentStatusIndicatorComponent } from './agent-status-indicator.component';

describe('AgentStatusIndicatorComponent', () => {
  let component: AgentStatusIndicatorComponent;
  let fixture: ComponentFixture<AgentStatusIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentStatusIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentStatusIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
