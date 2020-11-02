import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentStatusDetailsComponent } from './agent-status-details.component';

describe('AgentStatusDetailsComponent', () => {
  let component: AgentStatusDetailsComponent;
  let fixture: ComponentFixture<AgentStatusDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentStatusDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentStatusDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
