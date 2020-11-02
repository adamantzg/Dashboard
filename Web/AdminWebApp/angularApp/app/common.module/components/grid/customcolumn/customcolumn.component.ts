import { Component, OnInit, Input, Output, ComponentFactoryResolver,
  ViewContainerRef, Injector, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { GridColumn } from '../grid';

@Component({
  selector: 'app-customcolumn',
  templateUrl: './customcolumn.component.html',
  styleUrls: ['./customcolumn.component.scss']
})
export class CustomcolumnComponent implements AfterViewInit {

  constructor(private resolver: ComponentFactoryResolver ) { }

  @Input()
  row: any;
  @Input()
  column: GridColumn;
  component: any;

  @Output()
  CustomColumnEvent = new EventEmitter();

  @ViewChild('content', { read: ViewContainerRef }) content;

  ngAfterViewInit() {
    const factory = this.resolver.resolveComponentFactory(this.column.customComponentType);
    this.component = this.content.createComponent(factory);
    this.component.instance.row = this.row;
    this.component.instance.column = this.column;
    if(this.component.instance.CustomColumnEvent) {
      this.component.instance.CustomColumnEvent.subscribe(
        (event: CustomGridColumnContentEventData) => {
          this.CustomColumnEvent.emit(new CustomColumnComponentEventData(this.column, event.name, event.data));
        }
      )
    }
    
  }

}

export interface ICustomGridColumnComponentContent {
  row: any;
  column: GridColumn;
  CustomColumnEvent: EventEmitter<any>;
}

export class CustomColumnComponentEventData {

  constructor(public column: GridColumn, public name: string, public data: any) {
  }
}

export class CustomGridColumnContentEventData {
  constructor(public name: string, public data: any) {

  }
}
