import { Injectable } from "@angular/core";
import { HttpService } from "./http.service";
import { Dashboard } from "../domainclasses";

@Injectable()
export class DashboardService {
    constructor(private httpService: HttpService) {
    }

    api = 'api/dashboard';
    
    get() {
        return this.httpService.get(this.api);
    }

    update(d: Dashboard ) {
        return this.httpService.put(this.api, d);
    }

    create(d: Dashboard) {
        return this.httpService.post(this.api, d);
    }
}