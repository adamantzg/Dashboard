import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentGroupstatusIndicatorComponent } from './agent-groupstatus-indicator.component';

describe('AgentGroupstatusIndicatorComponent', () => {
  let component: AgentGroupstatusIndicatorComponent;
  let fixture: ComponentFixture<AgentGroupstatusIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentGroupstatusIndicatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentGroupstatusIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
