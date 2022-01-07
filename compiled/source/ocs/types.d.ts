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
export declare enum OcsShareType {
    user = 0,
    group = 1,
    publicLink = 3,
    federatedCloudShare = 6
}
export declare enum OcsSharePermissions {
    default = -1,
    read = 1,
    update = 2,
    create = 4,
    delete = 8,
    share = 16,
    all = 31
}
export interface OcsShare {
    id: number;
    shareType: OcsShareType;
    shareTypeSystemName: string;
    ownerUserId: string;
    ownerDisplayName: string;
    permissions: OcsSharePermissions;
    permissionsText: string;
    sharedOn: Date;
    sharedOnTimestamp: number;
    parent: string;
    expiration: Date;
    token: string;
    fileOwnerUserId: string;
    fileOwnerDisplayName: string;
    note: string;
    label: string;
    path: string;
    itemType: 'file' | 'folder';
    mimeType: string;
    storageId: string;
    storage: number;
    fileId: number;
    parentFileId: number;
    fileTarget: string;
    sharedWith: string;
    sharedWithDisplayName: string;
    mailSend: boolean;
    hideDownload: boolean;
    password?: string;
    sendPasswordByTalk?: boolean;
    url?: string;
}
export declare type OcsEditShareField = 'permissions' | 'password' | 'publicUpload' | 'expireDate' | 'note';
export interface OcsGroupfolderManageRule {
    type: 'group' | 'user';
    id: string;
    displayname: string;
}
export interface OcsGroupfolder {
    id: number;
    mountPoint: string;
    groups: Record<string, number>;
    quota: number;
    size: number;
    acl: boolean;
    manage?: OcsGroupfolderManageRule[];
}
