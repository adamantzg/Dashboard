import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AgentDescriptor } from '../../../../domainclasses';
import { GridDefinition, GridColumn, GridColumnType, Sort, ColumnDataType, SortDirection, CustomColumnEventData } from '../../../../common.module';
import { AgentStatusIndicatorGridColumnComponent } from '../agent-status-indicator/agent-status-indicator-gridcolumn';
import * as moment from 'moment';
import { WidgetService } from '../../../../services/widget.service';

@Component({
  selector: 'app-agent-groupstatus-indicator',
  templateUrl: './agent-groupstatus-indicator.component.html',
  styleUrls: ['./agent-groupstatus-indicator.component.css']
})
export class AgentGroupstatusIndicatorComponent implements OnInit {

  constructor(private widgetService: WidgetService) { }

  _data: GroupStatusIndicatorData;
  expanded = false;
  gridDefinition: GridDefinition;

  @Input()  
  public set data(v : GroupStatusIndicatorData) {
    this._data = v;
    this.buildGrid();
  }
  
  public get data() : GroupStatusIndicatorData {
    return this._data;
  }      

  @Output()
  LastActiveTimeUpdated = new EventEmitter();
   

  ngOnInit(): void {
  }

  onLastActiveTimeUpdated(event) {
    this.LastActiveTimeUpdated.emit(event);
  }

  buildGrid() {
    const columns:GridColumn[] = [];
    for (let i = 0; i < this.data.columns.length; i++) {      
      const column = JSON.parse(JSON.stringify(this.data.columns[i]));
      column.sortable = true;
      columns.push(column);      
    }
    columns.push(new GridColumn('Status', '', GridColumnType.Custom, 'status', {'width' : '10%'},'',AgentStatusIndicatorGridColumnComponent));
    this.gridDefinition = new GridDefinition(columns);
  }

  onSortChange(sort: Sort) {
    this.data.descriptors = this.widgetService.sortData(this.data.descriptors, sort);
  }

  onCustomColumnEvent(event: CustomColumnEventData) {
    if(event.name == 'lastActiveTimeUpdated') {
      this.onLastActiveTimeUpdated(event.data);
    }
  }
  

}

export class GroupStatusIndicatorData {
  descriptors: AgentDescriptor[] = [];  
  refreshInterval = 30;  
  columns: GridColumn[] = [];
}
