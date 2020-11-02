import { Injectable } from "@angular/core";
import { HttpService } from "./http.service";
import {Observable } from 'rxjs/Observable';

@Injectable()
export class AccountService {
    constructor(private httpService: HttpService) {

    }

    apiRoot = 'api/account/';

    login(username: string, password: string) {
        return this.httpService.get(this.apiRoot + 'login', { params: { username: username, password: password}});
    }
}