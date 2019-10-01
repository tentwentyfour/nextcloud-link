export interface OcsActivity {
    activityId: number;
    app: string;
    type: string;
    user: string;
    subject: string;
    subjectRich: [];
    message: string;
    messageRich: [];
    objectType: string;
    fileId: number;
    objectName: string;
    objects: {};
    link: string;
    icon: string;
    datetime: Date;
}
export interface OcsUser {
    id: string;
    enabled: boolean;
    lastLogin: number;
    email: string;
    displayname: string;
    phone: string;
    address: string;
    website: string;
    twitter: string;
    groups: string[];
    language: string;
    locale: string;
}
export interface OcsNewUser {
    userid: string;
    password?: string;
    email?: string;
    displayName?: string;
    groups?: string[];
    subadmin?: string[];
    quota?: number;
    language?: string;
}
export declare type OcsEditUserField = 'password' | 'email' | 'displayname' | 'quota' | 'phone' | 'address' | 'website' | 'twitter' | 'locale' | 'language';
export interface OcsHttpError {
    code: number;
    message: string;
    meta?: {
        status: string;
        statuscode: number;
        message: string;
    };
}
