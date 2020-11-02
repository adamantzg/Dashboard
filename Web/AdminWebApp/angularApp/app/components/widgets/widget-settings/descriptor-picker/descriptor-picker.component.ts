import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AgentDescriptor } from '../../../../domainclasses';
import { AgentsService } from '../../../../services/agents.service';
import { CommonService } from '../../../../services/common.service';

@Component({
  selector: 'app-descriptor-picker',
  templateUrl: './descriptor-picker.component.html',
  styleUrls: ['./descriptor-picker.component.css']
})
export class DescriptorPickerComponent implements OnInit {

  constructor(private agentsService: AgentsService, 
    private commonService: CommonService) { }

  private _selectedDescriptorIds: string[];

  @Input()
  multiple = false;
  @Input()  
  public set selectedDescriptorIds(v : string[]) {
    this._selectedDescriptorIds = v;
    this.checkSelected();
  }

  public get selectedDescriptorIds() : string[] {
    return this._selectedDescriptorIds;
  }


  @Output()
  selectionChanged = new EventEmitter();
  
  descriptors: AgentDescriptor[] = [];  
  pagedDescriptors: AgentDescriptor[] = [];
  
  selected = '';
  errorMessage = '';
  page = 1;
  pageSize = 15;

  ngOnInit(): void {
    this.agentsService.DescriptorsModel.subscribe(
      (m) => {
        this.descriptors = JSON.parse(JSON.stringify(m.descriptors));
        this.pagedDescriptors = this.descriptors.length > this.pageSize ? this.descriptors.slice(0,this.pageSize) : this.descriptors;
        this.checkSelected();
      } ,
      err => this.errorMessage = this.commonService.getError(err)
    )
  }

  onDescriptorSelected() {
    if(this._selectedDescriptorIds.length == 0) {
      this._selectedDescriptorIds.push(this.selected);
    } else {
      this._selectedDescriptorIds[0] = this.selected;
    }
    if(this.selectionChanged) {
      this.selectionChanged.emit(this._selectedDescriptorIds);
    }
  }

  OnChecked(d: AgentDescriptor) {

    if(d.selected) {
      if(!this._selectedDescriptorIds.includes(d.id)) {
        this._selectedDescriptorIds.push(d.id);
      }
    } else {
      const index = this._selectedDescriptorIds.findIndex(id => id == d.id);
      if(index >= 0) {
        this._selectedDescriptorIds.splice(index, 1);
      }
    }
    if(this.selectionChanged) {
      this.selectionChanged.emit(this._selectedDescriptorIds);
    }
  }

  checkSelected() {
    
    if(this._selectedDescriptorIds && this.descriptors.length > 0) {
      for(const d of this.descriptors) {
        if(this._selectedDescriptorIds.includes(d.id)) {
          d.selected = true;
          if(!this.multiple) {
            this.selected = d.id;
            break;   
          }
        }
      }      
    }
  }

  pageChanged(event: any) {
    this.page = event.page;
    const start = (this.page -1 )*this.pageSize;
    this.pagedDescriptors = this.descriptors.slice(start, start + this.pageSize );
  }

}
