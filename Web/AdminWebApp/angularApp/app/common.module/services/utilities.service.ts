import { Injectable } from "@angular/core";

@Injectable()
export class UtilitiesService {

    getValueFromObject(obj: any, key: string) {
        if(!key.includes('[')) {
          return obj[key];
        }
        //process array/object accessor
        const parts = key.split('[');
        return obj[parts[0]][parts[1].replace(']','')];
    }

}