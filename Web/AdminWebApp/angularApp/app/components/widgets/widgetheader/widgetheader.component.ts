import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WidgetAction } from '../../../widgetmodels';

@Component({
  selector: 'app-widgetheader',
  templateUrl: './widgetheader.component.html'
})
export class WidgetHeaderComponent implements OnInit {

  constructor() { }

  @Input()
  title: string;
  @Input()
  actions: WidgetAction[] = [];

  @Output()
  ActionSelected = new EventEmitter();

  ngOnInit(): void {
  }

  onAction(a: WidgetAction) {
    if(this.ActionSelected != null) {
      this.ActionSelected.emit(a);
    }
  }

  openSettings() {
    this.onAction(new WidgetAction('Settings', 'settings'));
  }

}


