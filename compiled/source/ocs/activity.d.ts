import { OcsActivity } from './types';
export declare function ocsGetActivities(objectId: number, sort: 'asc' | 'desc', limit: number, sinceActivityId: number, callback: (error: {
    code: any;
    message: any;
}, activities?: OcsActivity[]) => void): void;
