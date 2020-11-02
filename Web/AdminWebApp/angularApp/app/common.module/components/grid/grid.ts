import { Type } from '@angular/core';

export class GridDefinition {
    columns: GridColumn[];
    fixedHeaders = false;
    multiSelect = false;
    scrollHeight: string;
    sort: Sort;
    columnVisibilityCallback: (c: GridColumn) => boolean;
    columnButtonVisibilityCallback: (row: any, name: string, button: string) => boolean;
    columnButtonDisabledStatusCallback: (row: any, name: string, button: string) => boolean;
    columnEditorVisibilityStatusCallback: (row: any, c: GridColumn) => boolean;

    constructor(columns: GridColumn[], fixedHeaders?: boolean, multiSelect?: boolean, scrollHeight?: string) {
      this.columns = columns;
      if (fixedHeaders != null) {
        this.fixedHeaders = fixedHeaders;
      }
      if (multiSelect != null) {
        this.multiSelect = multiSelect;
      }
      if (scrollHeight != null) {
        this.scrollHeight = scrollHeight;
      }
    }

    getColumn(name: string) {
      return this.columns.find(c => c.name === name || c.field == name);
    }
  }

  export class GridColumn {
    title: string;
    field: string;
    name: string;
    style: any;
    buttonCss: string;
    customComponentType: Type<any>;
    type: GridColumnType;
    data: any;
    sortable: boolean;
    dataType: ColumnDataType;
    format: any;
    selected: boolean; // used for checbox all selection
    buttonIcon: string;
    editorType: GridEditorType;
    editable = true;
    buttons: GridButton[] = [];
    editModes: GridEditMode[] = [GridEditMode.NoEdit];
    required: boolean;
    valueField: string; // dropdown data id
    displayField: string; // dropdown data title
    selectedValueField: string; // field in data to be updated by valueField
    dropdownData: any[];
    autoCompleteData: ColumnAutoCompleteData;
    multipleSelectionData: MultipleSelectionData;
    fieldValueCallback: any;

    constructor(title: string, field: string, type?: GridColumnType, name?: string, style?: any,
      buttonCss?: string, customComponentType?: Type<any>, data?: any, sortable?: boolean,
      dataType?: ColumnDataType, format?: any, buttonIcon?: string, editable?: boolean,
      editorType?: GridEditorType, buttons?: GridButton[], editModes?: GridEditMode[],
      required?: boolean, autoCompleteData?: ColumnAutoCompleteData, multipleSelectionData?: MultipleSelectionData,
       fieldValueCallback?: any) {
      this.title = title;
      this.field = field;
      this.name = name;
      if (type != null) {
        this.type = type;
      } else {
        this.type = GridColumnType.Label;
      }
      this.style = style;
      this.buttonCss = buttonCss;
      if (name == null) {
        this.name = this.title;
      }
      this.customComponentType = customComponentType;
      this.data = data;
      this.sortable = sortable;
      this.dataType = dataType;
      if (this.dataType == null) {
        this.dataType = ColumnDataType.Text;
      }
      this.format = format;
      this.buttonIcon = buttonIcon;
      this.editorType = editorType;
      if (editable != null) {
        this.editable = editable;
      }

      if (this.editorType == null) {
        this.editorType = GridEditorType.Textbox;
      }
      this.buttons = buttons;
      if (editModes != null) {
        this.editModes = editModes;
      }
      this.required = required;
      this.autoCompleteData = autoCompleteData;
      this.multipleSelectionData = multipleSelectionData;
      this.fieldValueCallback = fieldValueCallback;
    }

  }

  export class GridButton {
    css: string;
    icon: string;
    text: string;
    name: string;
    requiresValidation = false;

    constructor(text: string, name: string, icon?: string, css?: string, requiresValidation?: boolean) {
      this.text = text;
      this.name = name;
      this.css = css;
      this.icon = icon;
      if (requiresValidation) {
        this.requiresValidation = requiresValidation;
      }
    }
  }

  export class ButtonGroupColumn extends GridColumn {
    buttons: GridButton[] = [];
    editModes: GridEditMode[] = [GridEditMode.NoEdit];

    constructor(title: string, buttons: GridButton[], editModes?: GridEditMode[]) {
      super(title, '', GridColumnType.ButtonGroup);
      this.buttons = buttons;
      if (editModes != null) {
        this.editModes = editModes;
      }
    }
  }

  export class GridButtonEventData {
    column: string;
    row: any;
    name: string;

    constructor(column: string, row: any, name?: string) {
      this.column = column;
      this.row = row;
      this.name = name;
    }
  }

  export class CustomColumnEventData {

    constructor(public name: string, public row: any, public column: GridColumn, public data: any) {

    }
  }

  export enum GridColumnType {
    Label = 0,
    Checkbox = 1,
    Button = 2,
    Custom = 3,
    Checkmark = 4,
    ButtonGroup = 5
  }

  export enum ColumnDataType {
    Text,
    Numeric,
    Date,
    Currency,
    Percent
  }

  export enum SortDirection {
    Asc = 0,
    Desc = 1
  }

  export class Sort {
    column: GridColumn;
    direction: SortDirection;

    constructor(column: GridColumn, direction: SortDirection) {
      this.column = column;
      this.direction = direction;
    }
  }

  export enum GridEditMode {
    NoEdit,
    AddNew,
    Edit
  }

  export enum GridEditorType {
    Textbox,
    Checkbox,
    Dropdown,
    Autocomplete,
    MultipleChoiceTagInput,
    MultipleChoiceCheckboxes
  }

  export class ColumnAutoCompleteData {
    data: any[];
    onSelectedCallback: (obj: any) => any;
    optionsLimit = 20;
    loadingCallback: (isLoading: boolean) => any;
    minLength = 3;
    optionField: string;

    constructor(data: any[], optionsLimit: number, minLength: number, optionField: string, onSelectedCallback: any, loadingCallback: any) {
      this.data = data;
      this.optionsLimit = optionsLimit;
      this.minLength = minLength;
      this.optionField = optionField;
      this.onSelectedCallback = onSelectedCallback;
      this.loadingCallback = loadingCallback;
    }
  }

  export class MultipleSelectionData {
    autocompleteItems: any[];
    autocompleteOnly = false;
    idField = 'id';
    displayField = 'name';
    placeHolder = 'Choose...';
    selectedField = 'selected';

    constructor(autocompleteOnly?: boolean, autocompleteItems?: any[], idField: string = 'id',
      displayField: string = 'name', selectedField: string = 'selected', placeHolder?: string ) {
      this.autocompleteItems = autocompleteItems;
      this.autocompleteOnly = autocompleteOnly;
      this.idField = idField;
      this.displayField = displayField;
      this.selectedField = selectedField;
      this.placeHolder = placeHolder;
    }
  }
  