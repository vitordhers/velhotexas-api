import { Injectable } from "@nestjs/common";
import * as moment from 'moment';
import { writeFile } from "fs";

@Injectable()
export class LoggerService {
    constructor() { }

    errorLogger(error: any, fn: string, location: string, details?: any) {
        const log = {
            error,
            details,
            function: fn,
            date: moment(new Date(), 'dd/mm/yyy'),
            location
        }
        const json = JSON.stringify(log);

        writeFile(`../errors/${new Date()}.json`, json, () => { });
    }
}