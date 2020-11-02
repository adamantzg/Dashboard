import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { ChannelServiceData } from "../domainclasses";
import { HttpService } from "./http.service";
import { StreamStatus } from "../widgetmodels";

@Injectable()
export class ChannelService {
    constructor(private httpService: HttpService) {

    }

    getServices(): Observable<ChannelServiceData[]> {
        return of(
            [
                /*{
                    country: 'Hrvatska',
                    serviceUrl: 'http://streamer1.streamsink.com:5002/api/'
                },
                {
                    country: 'Srbija',
                    serviceUrl: 'http://streamer1.streamsink.com:5003/api/'
                },
                {
                    country: 'Slovenija',
                    serviceUrl: 'http://streamer1.streamsink.com:5004/api/'
                },
                {
                    country: 'Ex-Yu',
                    serviceUrl: 'http://streamer1.streamsink.com:5005/api/'
                },*/
                {
                    country: 'StickFire',
                    serviceUrl: 'http://streamer1.streamsink.com:5001/api/'
                }/*,
                {
                    country: 'Cyprus ME',
                    serviceUrl: 'http://streamer2.streamsink.com:5001/api/'
                },
                {
                    country: 'Caribbean MIS',
                    serviceUrl: 'http://streamer2.streamsink.com:5002/api/'
                },*/
            ]
        );
    }

    getCoverages(serviceRoot: string, shortInterval?: number, mediumInterval?: number, longInterval?: number ) {
        if(!shortInterval) {
            shortInterval = 60;
        }
        if(!mediumInterval) {
            mediumInterval = 1440;
        }
        if(!longInterval) {
            longInterval = 10080;
        }
        const params = { shortInterval, mediumInterval, longInterval};
        return this.httpService.getNoBlock(`${serviceRoot}streamstatus/recordingstats`, { params: params});
    }

    getStreamStatus(serviceRoot: string) {
        return this.httpService.getNoBlock(serviceRoot + 'streamstatus');
    }

    setUrl(serviceRoot: string, outputDirectory: string, url: string) {
        return this.httpService.getNoBlock(`${serviceRoot}streamstatus/SetUrl?StreamId=${encodeURIComponent(outputDirectory)}&Url=${encodeURIComponent(url)}`);
    }

    fetchStreamStatusLog(serviceRoot: string, streamStatus: StreamStatus) {
        return this.httpService.getNoBlock(`${serviceRoot}log/?StreamID=${encodeURIComponent(streamStatus.outputDirectory)}`);
    }
}
