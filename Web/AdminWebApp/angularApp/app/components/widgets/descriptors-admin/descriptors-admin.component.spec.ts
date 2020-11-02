import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptorsAdminComponent } from './descriptors-admin.component';

describe('DescriptorsAdminComponent', () => {
  let component: DescriptorsAdminComponent;
  let fixture: ComponentFixture<DescriptorsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DescriptorsAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DescriptorsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
