import { OcsActivity, OcsUser } from './types';
import { OcsConnection } from './ocs-connection';
import { ConnectionOptions } from '../types';
export declare function configureOcsConnection(options: ConnectionOptions): void;
export declare function getActivities(connection: OcsConnection, objectId: number | string, sort?: 'asc' | 'desc', limit?: number, sinceActivityId?: number): Promise<OcsActivity[]>;
export declare function getUser(connection: OcsConnection, userId: string): Promise<OcsUser>;
