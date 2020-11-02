import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentStatusDetailsModalComponent } from './agent-status-details-modal.component';

describe('AgentStatusDetailsModalComponent', () => {
  let component: AgentStatusDetailsModalComponent;
  let fixture: ComponentFixture<AgentStatusDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentStatusDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentStatusDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
