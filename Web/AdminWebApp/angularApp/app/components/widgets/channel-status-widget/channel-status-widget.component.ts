import { Component, OnInit, Input, ViewChildren, QueryList } from '@angular/core';
import { ChannelService } from '../../../services/channel.service';
import { ChannelServiceData } from '../../../domainclasses';
import { ChannelStatusWidget } from '../../../widgetmodels';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { ChannelListComponent } from './channel-list/channel-list.component';

@Component({
  selector: 'app-channel-status-widget',
  templateUrl: './channel-status-widget.component.html',
  styleUrls: ['./channel-status-widget.component.scss']
})
export class ChannelStatusWidgetComponent implements OnInit {

  constructor(private channelService: ChannelService) { }
  channelServices: ChannelServiceData[] = [];
  tabsSelected = {}
  startStopText = 'Pause';
  running = true;

  @Input()
  data: ChannelStatusWidget;

  @ViewChildren(ChannelListComponent) channelLists: QueryList<ChannelListComponent>;


  ngOnInit(): void {
    this.channelService.getServices().subscribe(
      (data) =>  {
        this.channelServices = data;
        if(data.length > 0) {
          this.tabsSelected[data[0].country] = true;
        }
        
      }
    )
  }

  onTabSelect(event: TabDirective) {
    this.tabsSelected[event.heading] = true;
  }

  startStop() {
    this.running = !this.running;
    this.channelLists.forEach(cl => cl.startStop(this.running));
    this.startStopText = this.running ? 'Stop' : 'Start';
  }

}
