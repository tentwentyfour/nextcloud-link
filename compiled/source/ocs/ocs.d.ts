import { OcsActivity, OcsUser } from './types';
import { ConnectionOptions } from '../types';
export declare function configureOcsConnection(options: ConnectionOptions): void;
export declare const activitiesGet: typeof rawActivitiesGet;
export declare const usersGetUser: typeof rawUsersGetUser;
declare function rawActivitiesGet(objectId: number | string, sort?: 'asc' | 'desc', limit?: number, sinceActivityId?: number): Promise<OcsActivity[]>;
declare function rawUsersGetUser(userId: string): Promise<OcsUser>;
export {};
