import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PasswordChange } from '../modelclasses';
import { HttpService } from './http.service';
import { User } from '../domainclasses';
import { Settings } from './settings';


@Injectable()
export class UserService {


  constructor(private http: HttpClient, private httpService: HttpService) {
    this.userSetEvent = new EventEmitter();
  }

  public userSetEvent: EventEmitter<any>;
  private _user: User;
  get User(): User {
    if (this._user == null) {
      this._user = this.loadUser();
    }
    return this._user;
  }

  api = 'api/user/';
  userKey = 'remoteadmintools_user';    

  getCurrentUser(): Observable<User> {
    return this.http.post<User>(this.api + 'getCurrent', null).pipe(
      tap((u: any) => this.saveUser(u))
    );
  }

  updatePassword(data: PasswordChange) {
    return this.httpService.post<PasswordChange>(this.api + 'updatePassword', data);
  }

  loadUser(): User {
    const sUser = localStorage.getItem(this.userKey);
    if (sUser != null) {
      return JSON.parse(sUser);
    }
    return null;
  }

  saveUser(user: User) {
    this._user = user;
    localStorage.setItem(this.userKey, JSON.stringify(user));    
    localStorage.setItem(Settings.tokenKey, user.token);
    this.userSetEvent.emit(user);
  }

  clearUser() {
    localStorage.removeItem(this.userKey);    
    this._user = null;
    this.userSetEvent.emit(null);
  }

  
  updateUser(user: User): Observable<User> {
    const url = user.id > 0 ? 'update' : 'create';
    return this.httpService.post<User>(this.api + url, user);
  }
  
  checkUsername (id: number, username: string) {
    return this.httpService.post(this.api + 'checkusername?username=' + username + '&id=' + id, null);
  }
  

  deleteUser(id: number) {
    return this.httpService.delete(this.api + 'delete?id=' + id);
  }
}
