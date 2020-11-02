import { Component, OnInit, TemplateRef, ViewChild, Input} from '@angular/core';
import { DescriptorsAdminWidget, WidgetAction } from '../../../widgetmodels';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AgentsService } from '../../../services/agents.service';
import { AgentDescriptor, Widget } from '../../../domainclasses';
import { GridDefinition, GridColumn, GridColumnType, GridButtonEventData, GridButton, GridEditMode, MessageboxService,
MessageBoxType, MessageBoxCommand, MessageBoxCommandValue, ColumnDataType, Sort, SortDirection } from '../../../common.module';
import { CommonService } from '../../../services/common.service';
import { WidgetSettingsModalComponent } from '../widget-settings/widget-settings-modal/widget-settings-modal.component';
import { WidgetSettingsComponent } from '../widget-settings/widget-settings/widget-settings.component';
import { WidgetService } from '../../../services/widget.service';
import * as moment from 'moment';


@Component({
  selector: 'app-descriptors-admin',
  templateUrl: './descriptors-admin.component.html',
  styleUrls: ['./descriptors-admin.component.scss']
})
export class DescriptorsAdminComponent implements OnInit {

  constructor(private modalService: BsModalService, 
    private agentsService: AgentsService, private commonService: CommonService,
    private messageBoxService: MessageboxService, private widgetService: WidgetService) { }

  @Input()
  data: DescriptorsAdminWidget;
  errorMessage = '';
  modalRef: BsModalRef;
  @ViewChild("template")
  modalTemplate: TemplateRef<any>;

  descriptorsModel: DescriptorsModel;
  agentRegistrationUrl = '';
  editMode = GridEditMode.NoEdit;
  descriptorCopy: AgentDescriptor = new AgentDescriptor();
  editedDescriptorId = '';

  gridDefinition = new GridDefinition(
    [
      new GridColumn('Id', 'id'),
      new GridColumn('Client', 'clientName'),
      new GridColumn('Machine', 'machineName'),
      new GridColumn('Agent name', 'agentName'),
      new GridColumn('Agent role', 'agentRole'),
      new GridColumn('SSH server', 'sshServer'),
      new GridColumn('Local port', 'localPort'),
      new GridColumn('Remote port', 'remotePort'),
      new GridColumn('Last active', 'lastActive',GridColumnType.Label, 'lastActive'),
      new GridColumn('buttons', null, GridColumnType.ButtonGroup, 'buttons', null, null, null, null, false, null, null, null, false,
      null,
      [
        new GridButton('Update', 'update', 'fa fa-check', 'btn-success btn-sm', true),
        new GridButton('Cancel', 'cancel', 'fa-times-circle-o', 'btn-warning btn-sm ml-2'),
        new GridButton('Edit', 'edit', 'fa-pencil-square-o', 'btn-secondary btn-sm'),
        new GridButton('Delete', 'delete', 'fa-remove', 'btn-danger btn-sm ml-2')        
      ])
    ]
  );

  ngOnInit(): void {
    this.gridDefinition.columnButtonVisibilityCallback = this.checkColumnButtonVisibility.bind(this);
    this.gridDefinition.columnEditorVisibilityStatusCallback = this.checkColumnEditorVisibilityStatus.bind(this);
    this.gridDefinition.columnButtonDisabledStatusCallback = this.checkColumnButtonDisabledStatus.bind(this);
    this.gridDefinition.getColumn('lastActive').dataType = ColumnDataType.Date;
    this.gridDefinition.getColumn('lastActive').format = { format: 'dd/MM/yyyy HH:mm:ss'};
    this.gridDefinition.sort = new Sort(this.gridDefinition.getColumn('lastActive'), SortDirection.Desc);
    for(const c of this.gridDefinition.columns) {
      if(c.name != 'buttons') {
        c.sortable = true;
      }
    }
    this.agentsService.DescriptorsModel.subscribe( 
      d => { 
        this.descriptorsModel = d;
        this.onGridSortChange(this.gridDefinition.sort);
      },
      err => this.errorMessage = this.commonService.getError(err)
      );
    
  }

  onAction(event: WidgetAction) {
    if(event.name == 'settings') {
      const modalRef = this.modalService.show(WidgetSettingsModalComponent);
      const widget: Widget = JSON.parse(JSON.stringify(this.data));
      
      modalRef.content.widget = widget;      
      modalRef.content.ComponentInitialized.subscribe(
        (c: WidgetSettingsComponent) => c.showDescriptors = false
      )
      modalRef.content.innerComponentType = WidgetSettingsComponent;      
      
      modalRef.content.onSave.subscribe(
        data => {
          this.data = data;
          this.data.settings = JSON.stringify(data.settingsObj);
          this.widgetService.update(this.data).subscribe(
            (w)=> {},
            err => this.errorMessage = this.commonService.getError(err)
            )
        }
      )
      
    } 
  }

 
  checkColumnButtonVisibility(a: AgentDescriptor, column: string, button: string) {

    if (button === 'edit') {
      return this.editMode === GridEditMode.NoEdit || a.id !== this.descriptorCopy.id;
      
    } else if (button === 'delete') {
      return this.editMode === GridEditMode.NoEdit || a.id !== this.descriptorCopy.id;
    } else if (button === 'update' || button === 'cancel') {
      return this.editMode !== GridEditMode.NoEdit && a.id === this.descriptorCopy.id;
    }
    return true;
  }

  checkColumnButtonDisabledStatus(a: AgentDescriptor, column: GridColumn, button: string) {
    if (button === 'delete' || button === 'edit') {
      return this.editMode !== GridEditMode.NoEdit;
    }
    return false;
  }

  checkColumnEditorVisibilityStatus(a: AgentDescriptor, column: GridColumn) {
    if ( column.name === 'id') {
      return false;
    }
    return true;
  }

  gridButtonClicked($event: GridButtonEventData) {
    
    if ($event.name === 'delete') {
      this.onDeleteRow($event.row);
    } else if ($event.name === 'edit') {
      this.onEditRow($event.row);
      this.editMode = GridEditMode.Edit;

    } else if ($event.name === 'cancel') {
      this.editMode = GridEditMode.NoEdit;
    } else if ($event.name === 'update') {
      this.onUpdateRow();
    }
  }

  onEditRow(a: AgentDescriptor) {
    this.descriptorCopy = JSON.parse(JSON.stringify(a));    
    this.editedDescriptorId = a.id;
  }

  onCancelRow() {
    this.editedDescriptorId = '';
  }
  onUpdateRow() {
    const descriptor = this.descriptorCopy;
    
    this.agentsService.updateDescriptor(descriptor).subscribe( (d: AgentDescriptor) => {
      this.errorMessage = '';
      
      const existingDescriptor = this.descriptorsModel.descriptors.find(ds => ds.id === descriptor.id);
      if (existingDescriptor != null) {
        Object.assign(existingDescriptor, d);
      }      
      this.editMode = GridEditMode.NoEdit;      
    },
    err => this.errorMessage = this.commonService.getError(err)
  );

  }
  onDeleteRow(a: AgentDescriptor) {
    this.messageBoxService.openDialog('Delete descriptor?', MessageBoxType.Yesno).subscribe((m: MessageBoxCommand) => {
      if (m.value === MessageBoxCommandValue.Ok) {
        this.errorMessage = '';
        this.agentsService.deleteDescriptor(a.id).subscribe( data => {
          const index = this.descriptorsModel.descriptors.findIndex(d => d.id === a.id);
          if (index >= 0) {
            this.descriptorsModel.descriptors.splice(index, 1);
          }
        },
        err => this.errorMessage = this.commonService.getError(err));

      }
    });

  }

  onGridSortChange(sort: Sort) {
    this.descriptorsModel.descriptors = this.widgetService.sortData(this.descriptorsModel.descriptors, sort);
  }

  refresh() {
    this.agentsService.getDescriptorModel().subscribe(
      (m: DescriptorsModel) => {
        this.descriptorsModel.descriptors = m.descriptors;
        this.onGridSortChange(this.gridDefinition.sort);
      }
    )
  }

}

export class DescriptorsModel {
  descriptors: AgentDescriptor[];
  registrationWebAppUrl: string;
}