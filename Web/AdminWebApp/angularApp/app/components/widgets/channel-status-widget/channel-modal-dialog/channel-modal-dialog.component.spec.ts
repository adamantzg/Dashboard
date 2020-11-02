import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelModalDialogComponent } from './channel-modal-dialog.component';

describe('ChannelModalDialogComponent', () => {
  let component: ChannelModalDialogComponent;
  let fixture: ComponentFixture<ChannelModalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelModalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelModalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
