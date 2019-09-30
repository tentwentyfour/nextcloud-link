import { OcsActivity } from './types';
export declare function ocsGetActivities(fileId: number, sort: 'asc' | 'desc', limit: number, sinceActivityId: number, callback: (error: {
    code: any;
    message: any;
}, activities?: OcsActivity[]) => void): void;
