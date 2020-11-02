import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IndicatorStatusData } from '../agent-status-indicator.component';

@Component({
  selector: 'app-agent-status-details-modal',
  templateUrl: './agent-status-details-modal.component.html',
  styleUrls: ['./agent-status-details-modal.component.css']
})
export class AgentStatusDetailsModalComponent implements OnInit {

  constructor(private bsModalRef: BsModalRef ) { }
  
  _data: IndicatorStatusData;

  
  public set data(v : IndicatorStatusData) {
    this._data = v;
  }
  
  public get data() : IndicatorStatusData {
    return this._data; 
  }
  
  

  ngOnInit(): void {
  }

  close() {
    this.bsModalRef.hide();
  }

  getDescription() {
    if(this._data) {
      const d = this._data.descriptor;
      return `Id: ${d.id} Server: ${d.machineName} Role: ${d.agentRole}`;
    }
  }

}
