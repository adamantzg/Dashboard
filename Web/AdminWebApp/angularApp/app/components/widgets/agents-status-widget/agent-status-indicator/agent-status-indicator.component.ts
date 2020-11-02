import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AgentDescriptor } from '../../../../domainclasses';
import { HttpService } from '../../../../services/http.service';
import * as moment from 'moment';
import { ArchiveDownloaderStatus } from '../../../../widgetmodels';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AgentStatusDetailsModalComponent } from './agent-status-details-modal/agent-status-details-modal.component';

@Component({
  selector: 'app-agent-status-indicator',
  templateUrl: './agent-status-indicator.component.html',
  styleUrls: ['./agent-status-indicator.component.css']
})
export class AgentStatusIndicatorComponent implements OnInit {

  constructor(private httpService: HttpService, private bsModalService: BsModalService) { }

  _data: IndicatorData;
  d: AgentDescriptor;
  status: ArchiveDownloaderStatus = null;
  lastChecked = null;
  inCheck = false;
  timeout = 10000;
  delay = DownloaderDelayEnum.noDelay;
  delayValues = Object.assign({}, DownloaderDelayEnum);  
  filesToGo = 0;
  timer = null;

  @Input()
  public set data(v : IndicatorData) {
    this._data = v;
    this.d = v.descriptor;
    this.timeout = v.interval > 10 ? 10000 :  v.interval * 750;  //75% of refresh interval if < 10
    if(this.timer) {
      clearTimeout(this.timer);
    }
    this.start();
  }    
  
  public get data() : IndicatorData {
    return this._data;
  }

  @Output()
  LastActiveTimeUpdated = new EventEmitter();
  
  
  ngOnInit(): void {
  }

  refresh() {
    this.inCheck = false;
    this.checkStatus();
  }
  
  start() {
    this.checkStatus();    
  }

  checkStatus() {
    const desc = this.d;
    if(desc) {
      if(!this.inCheck) {
        this.inCheck = true;
        if(desc.agentName.toLowerCase()=='archivedownloader') {
            this.httpService.getNoBlock(`http://${desc.sshServer}:${desc.remotePort}?cmd=status&detaillevel=full`, { timeout: this.timeout}).subscribe(
              (s:any) => {
                if(s && s.status) {
                  //old agent
                  if(desc.agentRole == 'download' || desc.agentRole == 'upload') {
                    //old but downloader or uploader, call with old api
                    this.httpService.getNoBlock(`http://${desc.sshServer}:${desc.remotePort}?cmd=get${desc.agentRole == 'download' ? 'Download' : 'Upload'}Status`, 
                      { timeout: this.timeout}).subscribe(
                        (ds: ArchiveDownloaderStatus) => {
                          this.processStatus(ds);
                        },
                        err => {
                          this.status = null;
                          this.finishCheck();
                        }
                      )        
                  } else {
                    this.status = s;
                    this.status.lastError = null;
                    desc.lastActive = moment().toDate();
                    this.LastActiveTimeUpdated.emit(desc);
                    this.delay = DownloaderDelayEnum.noDelay;
                    this.finishCheck();
                  }
                  
                } else {
                  this.processStatus(s);
                }
              }
            ,
            err => {
              this.status = null;
              this.finishCheck();
            });
          }    
        
      }      
    }    
  }

  processStatus(s: ArchiveDownloaderStatus) {
    
    this.status = s;
    if(this.status && this.status.lastException) {
      //fix for older agents
      this.status.lastError = this.status.lastException;
    }
    this.d.lastActive = moment().toDate();
    this.LastActiveTimeUpdated.emit(this.d);
    this.calculateDelay(s);
    this.finishCheck();
  }

  finishCheck() {
    this.inCheck = false;
    this.lastChecked = 'Last checked: ' + moment().format('DD/MM/YYYY HH:mm:ss');
    this.timer = setTimeout(()=> this.checkStatus(), this._data.interval * 1000);
  }

  calculateDelay(ds: ArchiveDownloaderStatus) {
    if(ds && ds.channelStatuses) {
      
      const filesPerChannel = ds.channelStatuses.map(s => this.d.agentRole != 'uploadthumbs' ? s.filesToGo : Math.floor(s.filesToGo / 20));
      const maxFiles = Math.max(...filesPerChannel);
      //special case for thumbsupload - 20 thumbs in 5 minutes (1 real file = 20 thumbs, 1 thumb for each 15 secs)
            
      if(maxFiles == 0) {
        this.delay = DownloaderDelayEnum.noDelay;
      } else if(maxFiles == 1) {
        this.delay = DownloaderDelayEnum.small;
      } else {
        this.delay = DownloaderDelayEnum.big;
      }
      this.filesToGo = filesPerChannel.reduce((a,b) => a + b,0);
    }
  }

  getTitle(text: string) {
    if(!this.data.showDescriptorInfo) {
      return text;
    }
    return `Id: ${this.data.descriptor.id} Agent: ${this.data.descriptor.agentName} Role: ${this.data.descriptor.agentRole} Status: ${text}`
  }

  getOperation() {
    if(this.d.agentRole == 'download') {
      return 'Downloading';
    } else {
      return 'Uploading';
    }
  }

  showDetails() {
    if(this.status) {
      const modal = this.bsModalService.show(AgentStatusDetailsModalComponent, {class: 'modal-xxl'});
      modal.content.data = new IndicatorStatusData(this.d, this.status);
    }
    
  }

}

export class IndicatorData {
  
  constructor(public descriptor: AgentDescriptor, public interval: number, public showDescriptorInfo: boolean) {

  }
}

export class IndicatorStatusData {
  constructor(public descriptor: AgentDescriptor, public status: ArchiveDownloaderStatus) {

  }
}

export enum DownloaderDelayEnum {
  noDelay,
  small,
  big
}