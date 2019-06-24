import { OcsActivity } from "./types";
import { ConnectionOptions } from "../types";
export declare function configureOcsConnection(options: ConnectionOptions): void;
declare function rawGetActivities(objectId: number | string): Promise<OcsActivity[]>;
export declare const getActivities: typeof rawGetActivities;
export {};
