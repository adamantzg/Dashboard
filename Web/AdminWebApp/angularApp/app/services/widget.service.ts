import { Injectable, Output, EventEmitter } from "@angular/core";
import { HttpService } from "./http.service";
import { Widget, AgentDescriptor } from "../domainclasses";
import { tap } from "rxjs/operators";
import { Sort, ColumnDataType, SortDirection } from "../common.module";
import * as moment from 'moment';
import { UtilitiesService } from "../common.module";

@Injectable()
export class WidgetService {
    constructor(private httpService: HttpService, private utilities: UtilitiesService) {

    }

    api = 'api/widget';

    @Output()
    WidgetUpdated = new EventEmitter();

    update(widget: Widget) {
        return this.httpService.put(this.api, widget).pipe(
            tap(w => {
               if(this.WidgetUpdated)  {
                   this.WidgetUpdated.emit(widget);
               }
            })
        );
    }

    getTypes() {
        return this.httpService.get(this.api + '/types');
    }

    sortData(list: any[], sort: Sort):any[] {
        return list.sort((a: any,b: any) => {
            if(sort.column.dataType != ColumnDataType.Date) {
              return (sort.direction == SortDirection.Asc ? 1 : -1) * 
              (this.utilities.getValueFromObject(a, sort.column.field) < this.utilities.getValueFromObject(b,sort.column.field) ? -1 : 1);
            } else {
              return (sort.direction == SortDirection.Asc ? 1 : -1) *  
                  (moment(this.utilities.getValueFromObject(a,sort.column.field) || '1900-01-01')
                  .isBefore(this.utilities.getValueFromObject(b,sort.column.field) || '1900-01-01') ? -1 : 1);
            }
          })  
    }
}