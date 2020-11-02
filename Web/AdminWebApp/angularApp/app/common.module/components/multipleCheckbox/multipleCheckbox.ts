import { Component, Input } from '@angular/core';

@Component({
    selector: 'multiple-checkbox',
    templateUrl: './multipleCheckbox.html',
    styleUrls: ['./multipleCheckbox.scss']
})
export class MultipleCheckboxComponent {
    @Input()
    displayField = 'name';
    @Input()
    idField = 'id';
    @Input()
    selectedField = 'selected';

    @Input()
    data: any[] = [];
}
