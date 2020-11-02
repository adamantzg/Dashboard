import { Widget, AgentDescriptor } from "./domainclasses";
import * as moment from 'moment';

export class WidgetAction {
    title = '';
    name = '';
    constructor(title: string, name: string) {
        this.title = title;
        this.name = name;
    }
}

export class ArchiveDownloaderWidget extends Widget {
    
    actions = [new WidgetAction('Download status', 'downloadStatus')];
}

export class ChannelStatusWidget extends Widget {

}

export class DescriptorsAdminWidget extends Widget {
    
}

export class AgentsStatusWidget extends Widget {
    settingsObj: AgentsStatusWidgetSettings;
}

export class WidgetSettings {
    height: string;
    descriptorIds: string[] = [];
}

export class AgentsStatusWidgetSettings extends WidgetSettings {
    refreshInterval: number;
    groupByServer: boolean;
    groupBy: string[] = [];
    lastActiveTimes: {}
}

export class ChannelStatus {
    domain: string;
    channel: string;
    lastDownloadedFile: string;
    lastUploadedFile: string;
    lastError: string;
    lastErrorTime: string;
    filesToGo: number;
    sourceFileType: string;
    highestFile: string;
    
}

export class ArchiveDownloaderStatus {
    channelStatuses: ChannelStatus[];
    totalFiles: number;
    lastError: string;
    lastException: string;
    
}

export class StreamLog {
    timeOfEntry: Date;
    message: string;    
  }
  export class StreamStatus {

    constructor(data: any) {
        Object.assign(this, data);
        if(this.recordingStartedTime != null) {
            this.recordingStartedTime = moment(this.recordingStartedTime).toDate();
        }
        if(this.recordingEndedTime != null)  {
            this.recordingEndedTime = moment(this.recordingEndedTime).toDate();
        }        
        this.elapsedTime = this.formattedElapsedTime();

    }
    outputDirectory: string;
    url: string;
    domain: string;
    stationName: string;
    recordingStartedTime: Date;
    recordingEndedTime: Date;
    
    hourOffset: number;
    fileDurationInSeconds: number;
    lastOpenFileName: string;
    streamTime: number;
    elapsedTime: string;
    intervalShort: string;
    intervalMedium: string;
    intervalLong: string;
    log: StreamLog[];

    isRunning(): boolean {
        return this.recordingStartedTime != null;
    }

    getStatus() {
        return this.isRunning() ? 'running' : 'down';
    }
    getElapsedTime() {
        if(this.isRunning()) {
            return moment().diff(this.recordingStartedTime);
        } else {
            return this.recordingEndedTime != null ? moment().diff(this.recordingEndedTime) : 0;
        }
    }

    formattedElapsedTime() {
        const duration = moment.duration(this.getElapsedTime());
        return `${this.formatInt(duration.hours())}:${this.formatInt(duration.minutes())}:${this.formatInt(duration.seconds())}`;
    }

    formatInt(int: number) {
        if (int < 10) {
          return `0${int}`;
        }
        return `${int}`;
    };

  }

  export class CoverageKeyValue {
      Key: string;
      Value: number[];
  }