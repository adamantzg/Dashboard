import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSettingsModalComponent } from './widget-settings-modal.component';

describe('WidgetSettingsModalComponent', () => {
  let component: WidgetSettingsModalComponent;
  let fixture: ComponentFixture<WidgetSettingsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetSettingsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
