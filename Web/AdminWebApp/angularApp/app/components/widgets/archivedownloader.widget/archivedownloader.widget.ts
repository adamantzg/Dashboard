import { Component, OnInit, Input } from '@angular/core';
import { ArchiveDownloaderWidget, WidgetAction, ArchiveDownloaderStatus } from '../../../widgetmodels';
import { BsModalService } from 'ngx-bootstrap/modal';
import { WidgetSettingsModalComponent } from '../widget-settings/widget-settings-modal/widget-settings-modal.component';
import { WidgetService } from '../../../services/widget.service';
import { CommonService } from '../../../services/common.service';
import { HttpService } from '../../../services/http.service';
import { WidgetSettingsComponent } from '../widget-settings/widget-settings/widget-settings.component';
import { AgentsService } from '../../../services/agents.service';
import { AgentDescriptor } from '../../../domainclasses';


@Component({
  selector: 'app-archivedownloader-widget',
  templateUrl: './archivedownloader.widget.html'
})
export class ArchiveDownloaderWidgetComponent implements OnInit {

  constructor(private modalService: BsModalService, 
    private widgetService: WidgetService, private commonService: CommonService,
    private httpService: HttpService, private agentsService: AgentsService) { }
  errorMessage = '';
  statusMessage = 'widget ready';
  agentRefreshInterval = 10;
  queryingAgent = false;
  descriptors: AgentDescriptor[] = [];

  @Input()
  data: ArchiveDownloaderWidget;

  ngOnInit(): void {
    this.agentsService.DescriptorsModel.subscribe(
      (m) => this.descriptors = m.descriptors,
      err => this.errorMessage = this.commonService.getError(err)
    )
  }

  onAction(event: WidgetAction) {
    if(event.name == 'settings') {
      const modalRef = this.modalService.show(WidgetSettingsModalComponent);
      modalRef.content.widget = this.data;
      modalRef.content.innerComponentType = WidgetSettingsComponent;      
      modalRef.content.onSave.subscribe(
        data => {
          this.data = data;
          this.data.settings = JSON.stringify(data.settingsObj);
          this.widgetService.update(this.data).subscribe(
            (w)=> this.statusMessage = 'Widget saved',
            err => this.errorMessage = this.commonService.getError(err)
            )
        }
      )
    } else if(event.name == 'downloadStatus') {
      setInterval(() => this.getDownloadStatus(), this.agentRefreshInterval)
    }
  }

  getDownloadStatus() {
    if(this.data.settingsObj.descriptorIds.length == 0) {
      this.errorMessage = 'No agents assigned to the widget';
      this.statusMessage = '';
      return;
    }
    if(!this.queryingAgent) {
      const descriptor = this.descriptors.find(d => d.id == this.data.settingsObj.descriptorIds[0]);
      if(descriptor == null) {
        this.errorMessage = 'Assigned descriptor no longer exists';
        this.statusMessage = '';
        return;
      }
      this.queryingAgent = true;
      const url = `http://${descriptor.sshServer}:${descriptor.remotePort}?cmd=getDownloadStatus`;
      this.httpService.get(url).subscribe(
        (status: ArchiveDownloaderStatus) => {
          this.statusMessage = `Agent responded - channels: ${status.channelStatuses.length}. Total files: ${status.totalFiles}`;
          this.queryingAgent = false;
          this.errorMessage = '';
        },
        err => {
          this.errorMessage = this.commonService.getError(err);
          this.queryingAgent = false;
          this.statusMessage = '';
        }
      )
    }
  }

}
