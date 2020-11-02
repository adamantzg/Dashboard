import { Component, OnInit, Input, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { AgentsService } from '../../../services/agents.service';
import { AgentDescriptor } from '../../../domainclasses';
import { CommonService } from '../../../services/common.service';
import { AgentsStatusWidget, WidgetAction } from '../../../widgetmodels';
import { BsModalService } from 'ngx-bootstrap/modal';
import { WidgetSettingsModalComponent } from '../widget-settings/widget-settings-modal/widget-settings-modal.component';
import { AgentStatusWidgetSettingsComponent } from './agent-status-widget-settings/agent-status-widget-settings.component';
import { WidgetService } from '../../../services/widget.service';
import { AgentStatusIndicatorComponent } from './agent-status-indicator/agent-status-indicator.component';
import * as moment from 'moment';
import { GridDefinition, GridColumn, Sort, GridColumnType, ColumnDataType, SortDirection, CustomColumnEventData } from '../../../common.module';
import { AgentStatusIndicatorGridColumnComponent } from './agent-status-indicator/agent-status-indicator-gridcolumn';
import { AgentGroupstatusIndicatorGridColumnComponent } from './agent-groupstatus-indicator/agent-groupstatus-indicator-gridcolumn.component';


@Component({
  selector: 'app-agents-status-widget',
  templateUrl: './agents-status-widget.component.html',
  styleUrls: ['./agents-status-widget.component.css']
})
export class AgentsStatusWidgetComponent implements OnInit {

  constructor(private agentsService: AgentsService, 
    private commonService: CommonService, private modalService: BsModalService,
    private widgetService: WidgetService) { }

  descriptors: AgentDescriptor[];;
  errorMessage = '';
  selectedDescriptors: AgentDescriptor[] = [];
  groupedDescriptors: DescriptorGroup[] = [];
  _data: AgentsStatusWidget;
  dateFormat = 'dd.MM.yyyy HH:mm:ss';
  groupCaptions = { 'machineName' : 'Machine', 'agentName' : 'Agent', 'agentRole' : 'Role', 'id' : 'Id', 'lastActive' : 'Last Active', 'remotePort' : 'Port' };
  fields = ['id', 'machineName', 'agentName', 'agentRole', 'lastActive', 'remotePort'];
  filteredFields: string[] = [];

  flatGridDefinition = new GridDefinition(
     [
       new GridColumn('Id','id'),
       new GridColumn('Machine','machineName'),
       new GridColumn('Agent','agentName'),
       new GridColumn('Role', 'agentRole'),
       new GridColumn('Port', 'remotePort'),
       new GridColumn('Last Active', 'lastActive'),       
       new GridColumn('Status', '', GridColumnType.Custom, 'status', {'width' : '10%'},'',AgentStatusIndicatorGridColumnComponent)
     ]
  );

  groupGridMainDef: GridDefinition;
  
  @ViewChildren(AgentStatusIndicatorComponent) indicators: QueryList<AgentStatusIndicatorComponent>;

  @Input()  
  public get data() : AgentsStatusWidget {
    return this._data;
  }
  
  public set data(v : AgentsStatusWidget) {
    this._data = v;
    this.updateDescriptors();        
  }
  
    

  ngOnInit(): void {
    for(const c of this.flatGridDefinition.columns) {
      if(c.name != 'status') {
        c.sortable = true;
      }          
    }
    this.flatGridDefinition.getColumn('lastActive').dataType = ColumnDataType.Date;
    this.flatGridDefinition.getColumn('lastActive').format = { format: 'dd.MM.yyyy HH:mm:ss'};
    this.flatGridDefinition.sort = new Sort(this.flatGridDefinition.getColumn('machineName'), SortDirection.Asc);
    this.agentsService.DescriptorsModel.subscribe(
      (m) => {
        this.descriptors = m.descriptors;
        this.updateDescriptors();        
      },
      err => this.errorMessage = this.commonService.getError(err)
    )
  }

  updateDescriptors() {
    if(this.descriptors && this.data && this.data.settingsObj) {
      this.selectedDescriptors = this.descriptors.filter(d => this.data.settingsObj.descriptorIds.includes(d.id));
      if(this.data.settingsObj.groupByServer) {
        //TODO: make it universal by allowing grouping by and criteria and multiple group bys
        this.data.settingsObj.groupBy = ['machineName'];
        this.filteredFields = this.fields.filter(f => !this.data.settingsObj.groupBy.includes(f));
        if(!this.groupGridMainDef) {
          this.buildGroupGridDef();
        }        
        this.getGroupedDescriptors(this.data.settingsObj.groupBy);
      } else {        
        this.data.settingsObj.groupBy = [];
        this.onFlatGridSortChanged(this.flatGridDefinition.sort);
      }      
    }
  }

  buildGroupGridDef() {
    const columns:GridColumn[] = [];
    if(this.data.settingsObj) {
      for(let i = 0;i< this.data.settingsObj.groupBy.length;i++) {
        const g = this.data.settingsObj.groupBy[i];
        const column = new GridColumn(this.groupCaptions[g], `groupBy[${i}]`,GridColumnType.Label,g);
        column.style = { width: '25%'};
        column.sortable = true;
        columns.push(column);
      }
      const statusColumn = new GridColumn('Status', 'status', GridColumnType.Custom, 'status', null, null, AgentGroupstatusIndicatorGridColumnComponent);
      statusColumn.data = { columns: this.flatGridDefinition.columns.filter(c => this.filteredFields.includes(c.field)), refreshInterval: this.data.settingsObj.refreshInterval};
      columns.push(statusColumn);
    }
    const def = new GridDefinition(columns);
    def.sort = new Sort(columns[0], SortDirection.Asc);
    this.groupGridMainDef = def;
  }

  onAction(event: WidgetAction) {
    if(event.name == 'settings') {
      const modalRef = this.modalService.show(WidgetSettingsModalComponent);
      const widget: AgentsStatusWidget = JSON.parse(JSON.stringify(this.data));
      if(!widget.settingsObj.refreshInterval) {
        widget.settingsObj.refreshInterval = 20;
      }
      modalRef.content.widget = widget;
      
      modalRef.content.innerComponentType = AgentStatusWidgetSettingsComponent;      
      modalRef.content.onSave.subscribe(
        data => {
          this.data = data;
          this.data.settings = JSON.stringify(data.settingsObj);
          this.widgetService.update(this.data).subscribe(
            (w)=> this.updateDescriptors(),
            err => this.errorMessage = this.commonService.getError(err)
            )
        }
      )
    } 
  }

  refresh() {
    this.indicators.forEach(ind => ind.refresh());
  } 

  getGroupedDescriptors(groupBy: string[]) {
    const keys = {};    
    for(const d of this.selectedDescriptors) {
      const key = this.getKey(groupBy, d);
      if(!(key in keys)) {
        keys[key] = [];
      }
      keys[key].push(d);
    }
    let grouped = [];
    for(const key in keys) {
      const group = new DescriptorGroup();
      group.groupBy = key.split('/');
      group.descriptors = keys[key];
      grouped.push(group);
    }
    grouped = this.widgetService.sortData(grouped, this.groupGridMainDef.sort);
    this.groupedDescriptors = grouped;
  }

  getKey(groupBy: string[], d: AgentDescriptor) {
    const values = [];
    for(const g of groupBy) {
      values.push(d[g]);
    }
    return values.join('/');
  }

  onLastActiveTimeUpdated(desc: AgentDescriptor) {    
    //last active is updated by agents on checkalive ping
    /*const data:any = Object.assign({}, desc);
    data.lastActive = moment(data.lastActive).format('YYYY-MM-DD HH:mm:ss');
    this.agentsService.updateLastActive(data).subscribe(
      (w)=> {},
      err => this.errorMessage = this.commonService.getError(err)
      )*/
  }

  onFlatGridSortChanged(sort: Sort) {
   this.selectedDescriptors = this.widgetService.sortData(this.selectedDescriptors, sort) ;
  }

  onGroupGridSortChanged(sort: Sort) {
    this.groupedDescriptors = this.widgetService.sortData(this.groupedDescriptors, sort);
  }

  onCustomColumnEvent(event: CustomColumnEventData) {
    if(event.name == 'lastActiveTimeUpdated') {
      this.onLastActiveTimeUpdated(event.data);
    }
  }
  
}

export class DescriptorGroup {
  groupBy: string[] = [];
  expanded = false;
  descriptors: AgentDescriptor[] = [];
}
