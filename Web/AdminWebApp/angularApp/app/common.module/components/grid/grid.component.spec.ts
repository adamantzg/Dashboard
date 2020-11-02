import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {GridDefinition, GridColumn, GridEditMode, GridColumnType, GridButton, GridButtonEventData} from './grid';
import { GridComponent } from './grid.component';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { ColumnFormatPipe } from './formatPipe';
import { CustomcolumnComponent } from './customcolumn/customcolumn.component';
import { TypeaheadModule } from 'ngx-bootstrap';
import * as $ from 'jquery';
import { CommonAppModule } from '../../common.module';


describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
 
  
});
