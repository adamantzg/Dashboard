import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelStatusWidgetComponent } from './channel-status-widget.component';

describe('ChannelStatusWidgetComponent', () => {
  let component: ChannelStatusWidgetComponent;
  let fixture: ComponentFixture<ChannelStatusWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelStatusWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelStatusWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
