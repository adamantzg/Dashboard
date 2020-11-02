import { Component } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { User } from '../../domainclasses';
import { UserService } from '../../services/user.service';
import { NgModel, NgForm } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent { 

  errorMessage = '';
  params = { username: '', password: ''};

  constructor(private accountService: AccountService, private router: Router,
    private commonService: CommonService, private userService: UserService) {

  }

  login() {
    this.accountService.login(this.params.username, this.params.password)
      .subscribe( 
        (u: User) => {
          this.userService.saveUser(u);
          this.router.navigate(['dashboard']);
        } ,
        err => this.errorMessage = this.commonService.getError(err)
      );    
  }

  checkShowValidationError(c: NgModel, f: NgForm) {
    return c.invalid && (c.dirty || c.touched || f.submitted)
  }

}
