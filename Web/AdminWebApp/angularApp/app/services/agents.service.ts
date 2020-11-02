import { Injectable } from "@angular/core";
import { AgentDescriptor } from "../domainclasses";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { HttpService } from "./http.service";


@Injectable()
export class AgentsService {
    constructor(private httpService: HttpService) {
        
    }
    
    _descriptorsModel: DescriptorsModel;
    loaded = false;
    api = 'api/agent';
    
    public get DescriptorsModel() : Observable<DescriptorsModel> {
        if(this.loaded) {
            return of(this._descriptorsModel);
        }
        return this.httpService.get(this.api).pipe(
            tap( data => {
                this._descriptorsModel = data;
                this.loaded = true;
            })
        )
    }

    getDescriptorModel() {
        return this.httpService.get(this.api);
    }

    updateDescriptor(descriptor: AgentDescriptor) {
        return this.httpService.put(this.api, descriptor).pipe(
            tap( (d: AgentDescriptor) => {
                const found = this._descriptorsModel.descriptors.find(a => a.id == d.id);
                if(found != null) {
                    Object.assign(found, d);
                }
            })
        );
    }

    updateLastActive(descriptor: AgentDescriptor) {
        return this.httpService.putNoBlock(this.api + '/updateLastActive', descriptor);
    }

    deleteDescriptor(id: string) {
        return this.httpService.delete(this.api + '?id=' + id);
    }

    
    
}

export class DescriptorsModel {
    descriptors: AgentDescriptor[];
    registrationWebAppUrl: string;
}