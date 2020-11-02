import { Injectable, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http/';
import { HttpService } from './http.service';
import { GlobalCommandsEnum } from '../modelclasses';

@Injectable()
export class CommonService {

  constructor(private httpService: HttpService) { }

  
  onGlobalCommand = new EventEmitter();

  getError(err: HttpErrorResponse): string {
    if (err.error instanceof Error) {
      return err.error.message;
    }
    if(err.message) {
      return err.message;
    }
    if (typeof(err.error) === 'string') {
      return err.error;
    }
    
  }

  deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  getUploadUrl() {
    return 'api/uploadImage';
  }

  getUploadFileUrl() {
      return 'api/uploadFile';
  }

  getTempUrl() {
    return 'api/getTempUrl';
  }

  uploadFile(url, file) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.httpService.post(url, formData);
  }

  getSetting(name: string) {
      return this.httpService.get('api/getSetting', { params: {name: name}});
  }

  globalCommand(command: GlobalCommandsEnum, params?: any) {
    this.onGlobalCommand.emit(new GlobalCommandEventData(command, params));
  }

}

export class GlobalCommandEventData {
  constructor(public command: GlobalCommandsEnum, public params: any) {}
}
