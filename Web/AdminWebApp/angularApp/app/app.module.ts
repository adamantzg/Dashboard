
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy, CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

import { AppComponent } from './app.component';

// Import containers
import { DefaultLayoutComponent } from './containers';

const APP_CONTAINERS = [
  DefaultLayoutComponent
];

import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule,
} from '@coreui/angular';

// Import routing module
import { AppRoutingModule } from './app.routing';

// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpService } from './services/http.service';
import { AccountService } from './services/account.service';
import { BlockUIService } from './services/block-ui.service';
import { FormsModule } from '@angular/forms';
import { ErrorMessageComponent } from './components/errorMessage';
import { CommonService } from './services/common.service';
import { AuthGuard } from './services/auth-guard.service';
import { UserService } from './services/user.service';
import { DashboardService } from './services/dashboard.service';
import { WidgetHeaderComponent } from './components/widgets/widgetheader/widgetheader.component';
import { ArchiveDownloaderWidgetComponent } from './components/widgets/archivedownloader.widget/archivedownloader.widget';
import { DashboardTabComponent } from './components/dashboardtab/dashboardtab.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AgentsService } from './services/agents.service';
import { WidgetSettingsModalComponent } from './components/widgets/widget-settings/widget-settings-modal/widget-settings-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { WidgetService } from './services/widget.service';
import { ChannelStatusWidgetComponent } from './components/widgets/channel-status-widget/channel-status-widget.component';
import { ChannelService } from './services/channel.service';
import { ChannelListComponent } from './components/widgets/channel-status-widget/channel-list/channel-list.component';
import { DescriptorsAdminComponent } from './components/widgets/descriptors-admin/descriptors-admin.component';
import { CommonAppModule } from './common.module/common.module';
import { ChannelModalDialogComponent } from './components/widgets/channel-status-widget/channel-modal-dialog/channel-modal-dialog.component';
import { BlockUiComponent } from './components/block-ui/block-ui.component';
import { AgentsStatusWidgetComponent } from './components/widgets/agents-status-widget/agents-status-widget.component';
import { WidgetSettingsComponent } from './components/widgets/widget-settings/widget-settings/widget-settings.component';
import { DescriptorPickerComponent } from './components/widgets/widget-settings/descriptor-picker/descriptor-picker.component';
import { AgentStatusWidgetSettingsComponent } from './components/widgets/agents-status-widget/agent-status-widget-settings/agent-status-widget-settings.component';
import { AgentStatusIndicatorComponent } from './components/widgets/agents-status-widget/agent-status-indicator/agent-status-indicator.component';
import { TimeoutInterceptor, DEFAULT_TIMEOUT } from './services/timeout-interceptor';
import { LoginComponent } from './components/login/login.component';
import { ToastrModule } from 'ngx-toastr';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AgentStatusIndicatorGridColumnComponent } from './components/widgets/agents-status-widget/agent-status-indicator/agent-status-indicator-gridcolumn';
import { AgentGroupstatusIndicatorComponent } from './components/widgets/agents-status-widget/agent-groupstatus-indicator/agent-groupstatus-indicator.component';
import { AgentGroupstatusIndicatorGridColumnComponent } from './components/widgets/agents-status-widget/agent-groupstatus-indicator/agent-groupstatus-indicator-gridcolumn.component';
import { UtilitiesService } from './common.module';
import { AgentStatusDetailsComponent } from './components/widgets/agents-status-widget/agent-status-indicator/agent-status-details/agent-status-details.component';
import { AgentStatusDetailsModalComponent } from './components/widgets/agents-status-widget/agent-status-indicator/agent-status-details-modal/agent-status-details-modal.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    CommonModule,
    HttpClientModule,
    PerfectScrollbarModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    ChartsModule,
    FormsModule,
    CommonAppModule,
    ToastrModule.forRoot()
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    ErrorMessageComponent,
    LoginComponent,
    ArchiveDownloaderWidgetComponent,
    WidgetHeaderComponent,
    DashboardTabComponent,
    DashboardComponent,
    WidgetSettingsModalComponent,
    ChannelStatusWidgetComponent,
    ChannelListComponent,
    DescriptorsAdminComponent,
    ChannelModalDialogComponent,
    BlockUiComponent,
    AgentsStatusWidgetComponent,
    WidgetSettingsComponent,
    DescriptorPickerComponent,
    AgentStatusWidgetSettingsComponent,
    AgentStatusIndicatorComponent,
    AgentStatusIndicatorGridColumnComponent,
    AgentGroupstatusIndicatorComponent,
    AgentGroupstatusIndicatorGridColumnComponent,
    AgentStatusDetailsComponent,
    AgentStatusDetailsModalComponent
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: HashLocationStrategy
  }, HttpService, AccountService, BlockUIService, CommonService, AuthGuard, UserService, DashboardService, AgentsService,
  WidgetService, ChannelService,UtilitiesService,
  { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },
  { provide: DEFAULT_TIMEOUT, useValue: 30000 }
],
  bootstrap: [ AppComponent ],
  entryComponents: [WidgetSettingsModalComponent, ChannelModalDialogComponent, WidgetSettingsComponent, AgentStatusWidgetSettingsComponent,
    AgentStatusIndicatorGridColumnComponent, AgentGroupstatusIndicatorGridColumnComponent, AgentStatusDetailsModalComponent]
})
export class AppModule { }

