import {Component } from '@angular/core';
import { navItems } from '../../_nav';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { GlobalCommandsEnum } from '../../modelclasses';

@Component({
  selector: 'app-layout',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent {
  public sidebarMinimized = false;
  public navItems = navItems;
  year = new Date().getFullYear();

  constructor(public userService: UserService, private router: Router, private commonService: CommonService) {
    
  }

  toggleMinimize(e: any) {
    this.sidebarMinimized = e;
  }

  logout() {
    this.userService.clearUser();
    this.router.navigate(['login']);
  }

  switchEdit() {
    this.commonService.globalCommand(GlobalCommandsEnum.SwitchDashboardEdit);
  }
}
