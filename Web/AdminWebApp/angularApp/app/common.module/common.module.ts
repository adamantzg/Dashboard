import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridComponent, MessageboxComponent } from './components';
import { CustomcolumnComponent } from './components/grid/customcolumn/customcolumn.component';
import { ColumnFormatPipe } from './components/grid/formatPipe';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MultipleCheckboxComponent } from './components/multipleCheckbox/multipleCheckbox';
import { MessageboxService } from './components/messagebox/messagebox.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TagInputModule } from 'ngx-chips';
import { UtilitiesService } from './services/utilities.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    TypeaheadModule,
    BsDatepickerModule.forRoot(),
    TagInputModule
  ],
  declarations: [
    GridComponent, CustomcolumnComponent, ColumnFormatPipe, MultipleCheckboxComponent, MessageboxComponent
  ],
  exports: [
    GridComponent
  ],
  providers: [MessageboxService, UtilitiesService ],
  entryComponents: [MessageboxComponent]
})
export class CommonAppModule { }
