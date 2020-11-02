import { Component, OnInit, EventEmitter } from '@angular/core';
import { BsModalRef} from 'ngx-bootstrap/modal';
import { MessageBoxCommand, MessageBoxType, MessageBoxCommandValue, IModalDialog } from '../ModalDialog';

@Component({
  selector: 'app-messagebox',
  templateUrl: './messagebox.component.html',
  styleUrls: ['./messagebox.component.scss']
})
export class MessageboxComponent implements OnInit, IModalDialog {

  constructor(private bsModalRef: BsModalRef) { }

  types = Object.assign({}, MessageBoxType);
  okText = 'OK';
  cancelText = 'Cancel';
  errorMessage = '';
  title = '';
  text = '';
  type: MessageBoxType;
  onCommand: EventEmitter<MessageBoxCommand> = new EventEmitter();
  comment = '';



  ngOnInit() {
  }

  ok() {
    this.onCommand.emit(new MessageBoxCommand(MessageBoxCommandValue.Ok, this.comment ));
    this.bsModalRef.hide();
  }

  cancel() {
    this.onCommand.emit(MessageBoxCommand.getCancel());
    this.bsModalRef.hide();
  }

}


