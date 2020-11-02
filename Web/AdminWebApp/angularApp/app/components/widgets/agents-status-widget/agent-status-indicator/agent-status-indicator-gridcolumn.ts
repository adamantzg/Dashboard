import { GridColumn, ICustomGridColumnComponentContent, CustomGridColumnContentEventData } from "../../../../common.module";
import { Component, OnChanges, SimpleChanges, EventEmitter } from "@angular/core";
import { IndicatorData } from "./agent-status-indicator.component";
import { AgentDescriptor } from "../../../../domainclasses";

@Component({
    selector: 'app-agent-status-indicator-gridcolumn',
    template: `<app-agent-status-indicator [data]="data" (LastActiveTimeUpdated)="onLastActiveTimeUpdated($event)" ></app-agent-status-indicator>`
  })  
export class AgentStatusIndicatorGridColumnComponent implements ICustomGridColumnComponentContent, OnChanges {
    
    CustomColumnEvent = new EventEmitter<CustomGridColumnContentEventData>();
    
    column: GridColumn;

    
    refreshInterval = 30;
    data: IndicatorData;

    _row: AgentDescriptor;    
    public set row(v : AgentDescriptor) {
        this._row = v;
        const data = new IndicatorData(v, this.refreshInterval, false);        
        this.data = data;
    }
    
    public get row() : AgentDescriptor {
        return this._row;
    }
    
    ngOnChanges(changes: SimpleChanges) {
        /* if(changes['refreshInterval']) {
            this.data.interval = changes['refreshInterval'].currentValue;
        } */
    }

    onLastActiveTimeUpdated(event) {
        this.CustomColumnEvent.emit(new CustomGridColumnContentEventData('lastActiveTimeUpdated', event));
    }
    
}