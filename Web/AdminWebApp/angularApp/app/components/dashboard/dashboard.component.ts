import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { Dashboard, AgentDescriptor, DashboardTab, Widget } from '../../domainclasses';
import { CommonService, GlobalCommandEventData } from '../../services/common.service';
import { AgentsService } from '../../services/agents.service';
import { GlobalCommandsEnum } from '../../modelclasses';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import { MessageboxService, MessageBoxType, MessageBoxCommand, MessageBoxCommandValue } from '../../common.module';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { WidgetService } from '../../services/widget.service';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private dashboardService: DashboardService, 
    private commonService: CommonService, private agentsService: AgentsService, 
    private messageBoxService: MessageboxService, private router: Router, private userService: UserService,
    private toastrService: ToastrService, private widgetService: WidgetService ) {
      
      commonService.onGlobalCommand.subscribe(event => this.processGlobalCommand(event));
      widgetService.WidgetUpdated.subscribe(widget => this.onWidgetUpdated(widget));
  }

  dashboard: Dashboard;
  agents: AgentDescriptor[] = [];
  errorMessage = '';
  inDesign = false;  
  addTabId = 0;
  newTabId = -1;
  layoutChanged = false;
  tabs: DashboardTab[] = [];  
  editedTitleId = null;
  edit = {
    editedTitleId : null,
    editedTitle: ''
  }

  ngOnInit(): void {
    
    this.dashboardService.get().subscribe(
      (data: Dashboard) => { 
        if(data != null) {
          data.tabs = data.tabs.sort((t1,t2) => t1.orderIndex - t2.orderIndex);        
          this.dashboard = data;
        } else {
          this.dashboard = new Dashboard();
          this.dashboard.name = this.userService.User.name + '\'s dashboard';
          this.dashboard.userId = this.userService.User.id;
          this.dashboard.tabs = [];
        }        
        this.tabs = this.dashboard.tabs;
      },
      err => this.errorMessage = this.commonService.getError(err)
    )
    this.agentsService.DescriptorsModel.subscribe(
      data => this.agents = data.descriptors,
      (err: HttpErrorResponse) => {
        if(err.status == 401) {
          this.router.navigate(['/login']);
        }
        this.errorMessage = this.commonService.getError(err);
      } 
    )
  }

  processGlobalCommand(data: GlobalCommandEventData) {
    if(data.command == GlobalCommandsEnum.SwitchDashboardEdit) {
      if(this.inDesign) {
        //TODO: warn to save layout
        this.checkLayoutChanged().subscribe(
          () => {
            this.inDesign = !this.inDesign;
            this.tabs = this.dashboard.tabs;
          }
        );        
      } else {
        this.tabs = JSON.parse(JSON.stringify(this.dashboard.tabs));
        this.inDesign = !this.inDesign;
        this.layoutChanged = false;
      }
      
    }
  }

  checkLayoutChanged() {
    return new Observable(observer => {
      if(this.layoutChanged) {
        this.messageBoxService.openDialog('Layout changed. Do you want to save changes?', MessageBoxType.Yesno).subscribe(
          (cmd: MessageBoxCommand) => {
            if(cmd.value == MessageBoxCommandValue.Ok) {
              this.saveDashboard().subscribe(
                ()=> observer.next(),
                err => observer.error(err)
              );              
            } else {
              observer.next();
            }
            
          }
        )
      } else {
        observer.next();
      }
    });
  }

  addTab() {    
      const newOrderIndex = this.dashboard.tabs.length > 0 ? Math.max(...this.dashboard.tabs.map(t => t.orderIndex)) + 1 : 1;
      const tab = new DashboardTab();
      tab.id = this.newTabId--;
      tab.orderIndex = newOrderIndex;
      tab.name = 'New tab';
      tab.columns = 2;
      tab.widgets = [];
      this.layoutChanged = true;
      this.tabs.push(tab);
  }  

  saveDashboard() {
    return new Observable(observer => {
      const data = JSON.parse(JSON.stringify(this.dashboard));
      data.tabs = JSON.parse(JSON.stringify(this.tabs));
      for(const t of data.tabs) {
        if(t.id <= 0) {
          t.id = 0;
        }
        for(const w of t.widgets) {
          if(w.id <= 0) {
            w.id = 0;
            w.widgetType = null;
          }
        }
      }
      ( this.dashboard.id ? this.dashboardService.update(data) : this.dashboardService.create(data)).subscribe(
          (d: Dashboard) => {
            this.dashboard = d;
            this.toastrService.success('Dashboard layout saved');
            this.layoutChanged = false;
            observer.next();
          },
          err => {
            this.errorMessage = this.commonService.getError(err);
            observer.error(err);
          } 
      );    
    })
    
  }

  saveLayout() {
    this.saveDashboard().subscribe();
  }

  onTabRemoved(tab: TabDirective) {
    const id = +tab.id;
    const tabIndex = this.tabs.findIndex(t => t.id == id);
    if(tabIndex >= 0) {
      this.tabs.splice(tabIndex, 1);
      this.layoutChanged = true;
    }
  }

  onTitleStartEdit(id: number) {
    this.edit.editedTitle = this.getTab(id).name;
    this.edit.editedTitleId = id;
  }

  onTitleEditKeyDown(event: KeyboardEvent) {
    const stopPropagationKeys = ['ArrowLeft', 'Delete', 'ArrowRight', ' ', 'Home', 'End'];
    if(event.key == 'Enter') {
      const tab = this.getTab(this.edit.editedTitleId);
      if(tab != null) {
        tab.name = this.edit.editedTitle;
      }
      this.edit.editedTitleId = null;
    }
    if(stopPropagationKeys.includes(event.key)) {
      event.stopPropagation();
    }
    if(event.key == 'Esc') {
      this.edit.editedTitleId = null;
    }
  }

  getTab(id: number) {
    return this.tabs.find(t => t.id == id);
  }

  onTitleChanged() {
    this.layoutChanged = true;
  }

  onTabLayoutChanged() {
    this.layoutChanged = true;
  }

  onWidgetUpdated(w: Widget) {
    const tab = this.dashboard.tabs.find(t => t.id == w.tabId);
    if(tab) {
      const widget = tab.widgets.find(ew => ew.id == w.id);
      if(widget) {
        Object.assign(widget, w);
      }
    }
  }
}
