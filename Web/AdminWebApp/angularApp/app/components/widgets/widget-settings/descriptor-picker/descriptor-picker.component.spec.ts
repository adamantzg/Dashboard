import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptorPickerComponent } from './descriptor-picker.component';

describe('DescriptorPickerComponent', () => {
  let component: DescriptorPickerComponent;
  let fixture: ComponentFixture<DescriptorPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DescriptorPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
