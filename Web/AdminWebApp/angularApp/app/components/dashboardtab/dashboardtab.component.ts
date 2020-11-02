import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DashboardTab, WidgetTypeEnum, WidgetType, Widget } from '../../domainclasses';
import { ArchiveDownloaderWidget, WidgetSettings, ChannelStatusWidget, DescriptorsAdminWidget, AgentsStatusWidget } from '../../widgetmodels';
import { AgentsService } from '../../services/agents.service';
import { WidgetService } from '../../services/widget.service';

@Component({
  selector: 'app-dashboardtab',
  templateUrl: './dashboardtab.component.html',
  styleUrls: ['./dashboardtab.component.css']
})
export class DashboardTabComponent implements OnInit {

  constructor(private agentsService: AgentsService, private widgetService: WidgetService) { }

  _data: DashboardTab;
  _inDesign = false;  
  columns = [];
  WidgetTypes = Object.assign({}, WidgetTypeEnum);
  types: WidgetType[] = [];
  newWidgetId = -1;

  @Input()  
  public set InDesign(v : boolean) {
    this._inDesign = v;    
  }    
  
  public get InDesign() : boolean {
    return this._inDesign;
  }
  

  @Output()
  LayoutChanged = new EventEmitter();

  @Input()
  public get Data() : DashboardTab {
    return this._data;
  }
  
  public set Data(d : DashboardTab) {
    this._data = d;
    for (let i = 0; i < d.columns; i++) {
      const columnData = [];
      if(d.widgets) {
        d.widgets.filter(w => w.column == i).sort((a,b) => a.index - b.index).forEach(
          w => {
            let wdg = new Widget();
            if(w.widgetTypeId == WidgetTypeEnum.ArchiveDownloaderAgent) {
              wdg = new ArchiveDownloaderWidget();            
            } else if(w.widgetTypeId == WidgetTypeEnum.ChannelStatusInfo) {
              wdg = new ChannelStatusWidget();            
            } else if(w.widgetTypeId == WidgetTypeEnum.DescriptorsAdmin) {
              wdg = new DescriptorsAdminWidget();
            } else if(w.widgetTypeId == WidgetTypeEnum.AgentsStatus) {
              wdg = new AgentsStatusWidget();
            }
            Object.assign(wdg, w);            
            columnData.push(wdg);
            if(wdg.settings) {
              wdg.settingsObj = JSON.parse(wdg.settings);
            }
            else {
              wdg.settingsObj = new WidgetSettings();
            }
            
          }
        );
      }      
      this.columns.push(columnData);
    }
  }  

  ngOnInit(): void {
    this.widgetService.getTypes().subscribe(
      (data) => this.types = data
    );
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  changeColumns(change: number) {    
    if((change < 0 && this.Data.columns + change >= 1) || (change > 0 && this.Data.columns + change <= 4)) {      
        this.Data.columns += change;
        if(change > 0) {
          this.columns.push([]);
        } else {
          this.columns.splice(this.columns.length - 1, 1);
        }
        this.LayoutChanged.emit();
    }
  }
  
  getTabColumnWidth() {
    return Math.floor(100/this.columns.length).toString() + '%';
  }

  addWidget(columnIndex: number, t: WidgetType) {
    const columnWidgets = this.Data.widgets ? this.Data.widgets.filter(w => w.column == columnIndex) : [];
    const index = columnWidgets.length == 0 ? 1 : Math.max(...columnWidgets.map(w => w.index)) + 1;
    const columnData = this.columns[columnIndex];
    const widget = new Widget();
    widget.column = columnIndex;
    widget.index = index;
    widget.title = 'New Widget';
    widget.widgetType = t;
    widget.settingsObj = new WidgetSettings();
    widget.widgetTypeId = t.id;
    widget.id = this.newWidgetId--;
    if(!this.Data.widgets) {
      this.Data.widgets = [];
    }
    this.Data.widgets.push(widget);
    columnData.push(widget);
    this.LayoutChanged.emit();
  }

  removeWidget(columnIndex: number, w: Widget) {
    const columnData = this.columns[columnIndex];
    let index = this.Data.widgets.findIndex(x => x.id == w.id);
    if(index >= 0) {
      this.Data.widgets.splice(index, 1);
    }
    index = columnData.findIndex(x => x.id == w.id);
    if(index >= 0) {
      columnData.splice(index, 1);
    }
    this.LayoutChanged.emit();
  }

}
