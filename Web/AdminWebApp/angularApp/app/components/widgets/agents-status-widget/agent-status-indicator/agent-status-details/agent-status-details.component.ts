import { Component, OnInit, Input } from '@angular/core';
import { IndicatorStatusData } from '../agent-status-indicator.component';
import { GridDefinition, GridColumn, ColumnDataType, Sort } from '../../../../../common.module';
import { WidgetService } from '../../../../../services/widget.service';
import { ChannelStatus } from '../../../../../widgetmodels';

@Component({
  selector: 'app-agent-status-details',
  templateUrl: './agent-status-details.component.html',
  styleUrls: ['./agent-status-details.component.css']
})
export class AgentStatusDetailsComponent implements OnInit {

  constructor(private widgetService: WidgetService) { }

  dateFormat = 'dd.MM.yyyy HH:mm:ss';
  page=1;
  pageSize=15;
  pagedChannels: ChannelStatus[] = [];

  _data: IndicatorStatusData;

  @Input()  
  public set data(v : IndicatorStatusData) {
    this._data = v;
    if(v) {
      this.onPageChanged({ page: 1});
    }    
  }
  
  public get data() : IndicatorStatusData {
    return this._data;
  }
  
  

  gridDefinition = new GridDefinition(
      [
        new GridColumn('Domain','domain'),
        new GridColumn('Channel','channel'),
        new GridColumn('Last DL ','lastDownloadedFile'),
        new GridColumn('Last UP','lastUploadedFile'),
        new GridColumn('Error','lastError'),
        new GridColumn('Error time','lastErrorTime'),
        new GridColumn('Files to go', 'filesToGo')    
      ]
  )

  ngOnInit(): void {
    for(const c of this.gridDefinition.columns) {
      if(c.field == 'lastErrorTime') {
        c.dataType = ColumnDataType.Date;
        c.format = { format: this.dateFormat};
      }
      c.sortable = true;
    }
  }

  onSortChanged(sort: Sort) {
    this.data.status.channelStatuses = this.widgetService.sortData(this.data.status.channelStatuses, sort);
  }

  onPageChanged(event: any) {
    this.page = event.page;
    const start = (this.page -1 )*this.pageSize;
    this.pagedChannels = this.data.status.channelStatuses.slice(start, start + this.pageSize );
  }

}
