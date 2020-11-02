import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { StreamStatus } from '../../../../widgetmodels';
import * as moment from 'moment';
import { ChannelService } from '../../../../services/channel.service';
import { ChannelServiceData } from '../../../../domainclasses';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-channel-modal-dialog',
  templateUrl: './channel-modal-dialog.component.html',
  styleUrls: ['./channel-modal-dialog.component.scss']
})
export class ChannelModalDialogComponent implements OnInit {

  constructor(private bsModalRef: BsModalRef, 
    private channelService: ChannelService,
    private commonService: CommonService) { }

  
  public get status() : StreamStatus {
    return this._status;
  }
  
  public set status(v : StreamStatus) {
    this._status = JSON.parse(JSON.stringify(v));
    this.fetchLog();
  }
  
  _status: StreamStatus = new StreamStatus({});
  serviceData: ChannelServiceData;
  onSave = new EventEmitter();
  errorMessage = '';
  slicedLog = [];

  ngOnInit(): void {
    
  }

  close() {
    this.bsModalRef.hide();
  }

  getSlicedLog(log) {
    if(log) {
      return log.sort((d1,d2) => -1 * moment(d1.timeOfEntry).diff(d2.timeOfEntry, 'seconds')).slice(0,10);
    }
    return [];  
  }

  fetchLog() {
    this.channelService.fetchStreamStatusLog(this.serviceData.serviceUrl,this._status).subscribe(
      (data) => {
        this.status.log = data;
        this.slicedLog = this.getSlicedLog(data);
      },
      err => this.errorMessage = this.commonService.getError(err)
    )
  }

  save() {
    if(this.onSave) {
      this.onSave.emit(this._status);
      this.close();
    }
  }

}
