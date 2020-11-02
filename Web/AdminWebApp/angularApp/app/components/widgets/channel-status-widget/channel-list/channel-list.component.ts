import { Component, OnInit, Input } from '@angular/core';
import { ChannelServiceData } from '../../../../domainclasses';
import { ChannelService } from '../../../../services/channel.service';
import { CommonService } from '../../../../services/common.service';
import { CoverageKeyValue, StreamStatus } from '../../../../widgetmodels';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ChannelModalDialogComponent } from '../channel-modal-dialog/channel-modal-dialog.component';


@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit {

  constructor(private channelService: ChannelService,
    private commonService: CommonService, private bsModalService: BsModalService) { }
  
  refreshInterval = 5000;
  errorMessage = '';
  coverages = {};
  streamStatuses: StreamStatus[] = [];
  total = 0;
  running = 0;
  down = 0;
  loadingCoverages = false;
  loadingStatuses = false;
  firstTime = true;

  retrieveData = true;

  @Input()  
  public get serviceData() : ChannelServiceData {
    return this._serviceData;
  }
  
  public set serviceData(d : ChannelServiceData) {
    this._serviceData = d;
    this.loadData();    
  }
  
  
  _serviceData: ChannelServiceData;

  ngOnInit(): void {
  }

  loadData() {
    if (this.retrieveData) {
      this.loadCoverages();
      this.loadStreamStatus();        
    }
    
  }

  loadCoverages() {
    this.loadingCoverages = true;
    this.channelService.getCoverages(this.serviceData.serviceUrl).subscribe(
      (data: CoverageKeyValue[]) => {
        data.forEach(kv => {
          if(!(kv.Key in this.coverages)) {
            this.coverages[kv.Key] = kv.Value;
          }
        });
        this.loadingCoverages = false;
        this.checkLoaded();
      },
      err => this.errorMessage = this.commonService.getError(err)
    )
  }

  loadStreamStatus() {
    this.loadingStatuses = true;
    this.channelService.getStreamStatus(this.serviceData.serviceUrl).subscribe(
      (data: StreamStatus[]) => {
        this.streamStatuses = data.map( d => new StreamStatus(d));
        this.total = 0;
        this.running = 0;
        this.down = 0;
        this.streamStatuses.forEach( s => {
          this.total++;
          if(s.isRunning()) {
            this.running++;
          } else {
            this.down++;
          }
          
        });
        this.loadingStatuses = false;
        this.checkLoaded();
      },
      err => this.errorMessage = this.commonService.getError(err)
    )
  }

  checkLoaded() {
    if(!this.loadingStatuses && !this.loadingCoverages) {
      if(this.retrieveData) {
        setTimeout(()=>this.loadData(), this.refreshInterval);
      }      
    }
  }

  getCoverageClass(s: StreamStatus, index: number) {
    let value = 'cover ';    
    if (this.coverages && s.outputDirectory in this.coverages && this.coverages[s.outputDirectory].length > index) {
      const coverageValue = this.coverages[s.outputDirectory][index];
      if (coverageValue >= 99) {
        value += 'cover-ok';
      }
      else if (coverageValue >= 90) {
        value += 'cover-fair';
      }
      else if (coverageValue >= 50) {
        value += 'cover-some';
      } else {
        value += 'cover-bad';
      }      
    }
    return value;
  }

  showDetails(s: StreamStatus){
    const modal = this.bsModalService.show(ChannelModalDialogComponent, {
      class: 'modal-lg'
    });
    modal.content.serviceData = this.serviceData;
    modal.content.status = s;    
    modal.content.onSave.subscribe(
      (status) => {
        const found = this.streamStatuses.find(s => s.outputDirectory == status.outputDirectory);
        if(found && found.url != status.url) {
          found.url = status.url;
          this.setNewStreamStatusURL(status);
        }
      }
    )
  }

  setNewStreamStatusURL(status: StreamStatus) {
    this.channelService.setUrl(this.serviceData.serviceUrl, status.outputDirectory, status.url).subscribe(
      ()=> console.log('new url set'),
      err => this.errorMessage = this.commonService.getError(err)
    )
  }

  startStop(start = true) {
    this.retrieveData = start;
    if(start) {
      this.loadData();
    }
  }

}
