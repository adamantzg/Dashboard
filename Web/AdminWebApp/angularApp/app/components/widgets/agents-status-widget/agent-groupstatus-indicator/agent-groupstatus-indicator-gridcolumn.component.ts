import { ICustomGridColumnComponentContent, GridColumn, CustomGridColumnContentEventData } from "../../../../common.module";
import { DescriptorGroup } from "../agents-status-widget.component";
import { Component, EventEmitter } from "@angular/core";
import { GroupStatusIndicatorData } from "./agent-groupstatus-indicator.component";

@Component({
    selector: 'app-agent-groupstatus-indicator-gridcolumn',
    template: '<app-agent-groupstatus-indicator [data]="statusData" (LastActiveTimeUpdated)="onLastActiveTimeUpdated($event)"></app-agent-groupstatus-indicator>'
  })
export class AgentGroupstatusIndicatorGridColumnComponent implements ICustomGridColumnComponentContent {
    
    CustomColumnEvent = new EventEmitter<CustomGridColumnContentEventData>();
    
    _column: GridColumn;
    _row: DescriptorGroup;
    statusData: GroupStatusIndicatorData;
    
    public set row(v : DescriptorGroup) {
        this._row = v;
        if(this.column) {
            this.setStatusData();
        }
    }
    
    public get row() : DescriptorGroup {
        return this._row;
    }

    
    public set column(c : GridColumn) {
        this._column = c;
        if(this.row) {
            this.setStatusData();
        }
    }
    
    public get column() : GridColumn {
        return this._column;
    }
    
    setStatusData() {
        const statusData = new GroupStatusIndicatorData();
        statusData.columns = this.column.data.columns;        
        statusData.descriptors = this.row.descriptors;
        statusData.refreshInterval = this.column.data.refreshInterval;
        this.statusData = statusData;
    }
    
    
    onLastActiveTimeUpdated(event) {
        this.CustomColumnEvent.emit(new CustomGridColumnContentEventData('lastActiveTimeUpdated', event));
    }
    
}