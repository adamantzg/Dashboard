import { Component, OnInit, Input, EventEmitter, ComponentFactoryResolver, Type, ViewChild, ViewContainerRef, Output } from '@angular/core';
import { WidgetSettings } from '../../../../widgetmodels';
import { Widget, AgentDescriptor } from '../../../../domainclasses';
import { AgentsService } from '../../../../services/agents.service';
import { BsModalRef } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-widget-settings-modal',
  templateUrl: './widget-settings-modal.component.html',
  styleUrls: ['./widget-settings-modal.component.scss']
})
export class WidgetSettingsModalComponent implements OnInit {

  constructor(private agentsService: AgentsService, private modalRef: BsModalRef,
    private resolver: ComponentFactoryResolver) { }

  widget: Widget = new Widget();
  descriptors: AgentDescriptor[] = [];  
  
  onSave = new EventEmitter();
  _innerComponentType: Type<any>;
  
  public set innerComponentType(v : Type<any>) {
    this._innerComponentType = v;
    if(this.content) {
      this.initComponent();
    }
  }
  
  component: any;

  @ViewChild('content', { read: ViewContainerRef }) content;

  @Output()
  ComponentInitialized = new EventEmitter();

  ngOnInit(): void {
    if(this.innerComponentType) {
      this.initComponent();
    }    
  }

  initComponent() {
    const factory = this.resolver.resolveComponentFactory(this._innerComponentType);
    this.component = this.content.createComponent(factory);
    this.component.instance.widget = this.widget;
    if(this.ComponentInitialized) {
      this.ComponentInitialized.emit(this.component.instance);
    }
  }  

  close() {
    this.modalRef.hide();
  }
  
  save() {    
    this.onSave.emit(this.widget);
    this.modalRef.hide();
  }
}

