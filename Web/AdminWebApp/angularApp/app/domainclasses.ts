import { WidgetSettings, WidgetAction } from "./widgetmodels";

export class User {
    id: number | null;
    email: string;
    name: string;
    password: string;
    surname: string;
    username: string;
    created: Date | null;
    lastlogindate: Date | null;
    lastmodified: Date | null;
    verified: number | null;
    token: string;
}

export class Widget {
    id: number;
    url: string;
    title: string;
    widgetTypeId: number;
    settings: string;
    column: number;
    index: number;    
    widgetType: WidgetType;
    settingsObj: WidgetSettings;
    tabId: number;

    actions: WidgetAction[] = [];
}

export class WidgetType {
    id: number;
    name: string;
}

export enum WidgetTypeEnum {
    ArchiveDownloaderAgent = 1,
    ChannelStatusInfo = 2,
    DescriptorsAdmin = 3,
    AgentsStatus = 4
}

export class DashboardTab {
    id: number;
    name: string;
    orderIndex: number;
    widgets: Widget[];
    columns: number;
}

export class Dashboard {
    id: number;
    userId: number;
    name: string;
    tabs: DashboardTab[] = [];
}

export class AgentDescriptor {
    clientName: string;
    machineName: string;
    localIp: string;
    publicIp: string;
    agentName: string;
    id: string;
    sshServer: string;
    remotePort: number;
    localPort: number;
    agentRole: string;
    selected: boolean;
    lastActive: Date;
}

export class ChannelServiceData {
    country: string;
    serviceUrl: string;
}

