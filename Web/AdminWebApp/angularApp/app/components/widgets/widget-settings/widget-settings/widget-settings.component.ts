import { Component, OnInit, Input } from '@angular/core';
import { AgentDescriptor, Widget } from '../../../../domainclasses';

@Component({
  selector: 'app-widget-settings',
  templateUrl: './widget-settings.component.html',
  styleUrls: ['./widget-settings.component.css']
})
export class WidgetSettingsComponent implements OnInit {

  constructor() { }

  @Input()
  descriptorIds: string[] = [];
  @Input()
  widget: Widget;
  @Input()
  showDescriptors = true;  

  ngOnInit(): void {
  }

  onDescriptorPickerSelectionChanged(event: string[]) {
    this.widget.settingsObj.descriptorIds = event;
  }

}
