import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveDownloaderWidgetComponent } from './archivedownloader.widget';

describe('WidgetComponent', () => {
  let component: ArchiveDownloaderWidgetComponent;
  let fixture: ComponentFixture<ArchiveDownloaderWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchiveDownloaderWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveDownloaderWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
