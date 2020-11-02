import { Component, OnInit } from '@angular/core';
import { Widget } from '../../../../domainclasses';
import { AgentsStatusWidget } from '../../../../widgetmodels';

@Component({
  selector: 'app-agent-status-widget-settings',
  templateUrl: './agent-status-widget-settings.component.html',
  styleUrls: ['./agent-status-widget-settings.component.css']
})
export class AgentStatusWidgetSettingsComponent implements OnInit {

  constructor() { }
  widget: AgentsStatusWidget = new AgentsStatusWidget();

  ngOnInit(): void {
  }

  onDescriptorPickerSelectionChanged(event: string[]) {
    this.widget.settingsObj.descriptorIds = event;
  }
}
