# Nextcloud-link

This is the repository for the `nextcloud-link` Javascript/Typescript package, written by [TenTwentyFour S. à r.l.](https://tentwentyfour.lu)

We are in no way affiliated to Nextcloud GmbH, but have been explictly allowed us to use the name `nextcloud-link` for this NPM package.

## Getting started

You can install it from the command-line by doing:

`$ npm i nextcloud-link`

## Current features

 - [x] Interact with Nextcloud instances with WebDav
 - [x] Allows the use of streams for file transfer
 - [x] Test Nextcloud connectivity
 - [x] OCS methods for groups, users and activity.

## Definitions

### fileId
This is an OwnCloud property representing either a File or a Folder.
Because this name is used by Nextcloud, we have opted to use the same name for consistency.

### Sub Admin
This is a Nextcloud term used to describe a user that has administrator rights for a group.

## API

### Core

> `configureWebdavConnection(options: ConnectionOptions): void`

Configures the Nextcloud connection to talk to a specific Nextcloud WebDav endpoint. This does not issue any kind of request, so it doesn't throw if the parameters are incorrect. This merely sets internal variables.

> `checkConnectivity(): Promise\<boolean\>`

Checks whether the connection to the configured WebDav endpoint succeeds. This does not throw, it consistently returns a Promise wrapping a boolean.

> `pipeStream(path:  string, stream:  Stream.Readable):  Promise\<void\>` _(deprecated, will be removed in version 2, use uploadFromStream)_

> `uploadFromStream(targetPath:  string, stream:  Stream.Readable):  Promise\<void\>`

Saves the data obtained through `stream` to the Nextcloud instance at `path`.

Throws a `NotFoundError` if the path to the requested directory does not exist.

> `downloadToStream(sourcePath:  string, stream:  Stream.Readable):  Promise\<void\>`

Pipes the data obtained through `path` from the Nextcloud instance to the provided `stream`.

Throws a `NotFoundError` if the path to the requested directory does not exist.

> `as(username:  string, password:  string):  NextcloudClient`

Creates a copy of the client that runs the request as the user with the passed credentials.

This does absolutely no verification, so you should use `checkConnectivity` to verify the credentials.

> `createFolderHierarchy(path:  string):  Promise\<void\>`

This is basically a recursive `mkdir`.

> `put(path:  string, content:  Webdav.ContentType):  Promise\<void\>`

This saves a Webdav.ContentType at `path`.

Throws a `NotFoundError` if the path to the requested directory does not exist.

> `rename(fromFullPath:  string, toFileName:  string):  Promise\<void\>`

This allows to rename files or directories.

> `move(fromFullPath:  string, toFullPath:  string):  Promise\<void\>`

This allows to move files or entire directories.

> `getWriteStream(path:  string):  Promise\<Webdav.Stream\>`

Gets a write stream to a remote Nextcloud `path`.

Throws a `NotFoundError` if the path to the requested directory does not exist.

> `getReadStream(path:  string):  Promise\<Webdav.Stream\>`

Gets a read stream to a remote Nextcloud `path`.

> `getFolderProperties(path: string, extraProperties?: FileDetailProperty[]):  Promise\<FolderProperties\>`

Retrieves the properties for the folder.
Use extraProperties to request properties not returned by default.

> `touchFolder(path:  string):  Promise\<void\>`

Smart `mkdir` implementation that doesn't complain if the folder at `path` already exists.

> `getFiles(path:  string):  Promise\<string[]\>`

List files in a directory.

> `getFolderFileDetails(path:  string, extraProperties?: FileDetailProperty[]):  Promise\<FileDetails[]\>`

Same as `getFiles`, but returns fuller details instead of just file names.
Use extraProperties to request properties not returned by default.

> `remove(path:  string):  Promise\<void\>`

Removes file or directories. Does not complain if directories aren't empty.

> `exists(path:  string):  Promise\<boolean\>`

Simple test that checks whether a file or directory exists. This indicates it in the return value, not by throwing exceptions.

> `get(path:  string):  Promise<string  |  Buffer>`

Gets a file as a string/Buffer.

> `getCreatorByPath(path: string):  Promise\<string\>`

Gets the username of the user that created the file or folder.

> `getCreatorByFileId(fileId: number | string):  Promise\<string\>`

Gets the username of the user that created the file or folder.

### Activities

> `get(fileId: number | string, sort?: 'asc' | 'desc', limit?: number, sinceActivityId?: number):  Promise\<OcsActivity[]\>``

Returns all activities belonging to a file or folder.
Use the `limit` argument to override the server-default.

### Users

> `removeSubAdminFromGroup(userId: string, groupId: string):  Promise\<boolean\>`

Remove a user as a Sub Admin from a group.

> `addSubAdminToGroup(userId: string, groupId: string):  Promise\<boolean\>`

Add a user as a Sub Admin to a group.

> `resendWelcomeEmail(userId: string):  Promise\<boolean\>`

Resend the Welcome email to a user.

> `removeFromGroup(userId: string, groupId: string):  Promise\<boolean\>`

Remove a user from a group.

> `getSubAdminGroups(userId: string):  Promise\<string[]\>`

Gets a list of all the groups a user is a Sub Admin of.

> `setEnabled(userId: string, isEnabled: boolean):  Promise\<boolean\>`

Enables or disables a user.

> `addToGroup(userId: string, groupId: string):  Promise\<boolean\>`

Add a user to a group.

> `getGroups(userId: string):  Promise\<string[]\>`

Gets a list of all the groups a user is a member of.

> `delete(userId: string):  Promise\<boolean\>`

Delete a user.

> `edit(userId: string, field: OcsEditUserField, value: string):  Promise\<boolean\>`

Edit a single field of a user.

> `list(search?: string, limit?: number, offset?: number):  Promise\<string[]\>`

Gets a list of all users.
Use the `limit` argument to override the server-default.

> `add(user: OcsNewUser):  Promise\<boolean\>`

Add a new user.

> `get(userId: string):  Promise\<OcsUser\>`

Gets the user information.

### Groups

> `getSubAdmins: (groupId: string):  Promise<string[]>`

Gets a list of all the users that are a Sub Admin of the group.

> `getUsers: (groupId: string):  Promise<string[]>`

Gets a list of all the users that are a member of the group.

> `delete: (groupId: string):  Promise\<boolean\>`

Delete a group.

> `list: (search?: string, limit?: number, offset?: number):  Promise<string[]>`

Gets a list of all groups.
Use the `limit` argument to override the server-default.

> `add: (groupId: string):  Promise\<boolean\>`

Add a new group.

### Shares

> `delete: (shareId: string | number):  Promise\<boolean\>`

Delete a share.

> `list: (path?: string, includeReshares?: boolean, showForSubFiles?: boolean):  Promise\<OcsShare[]\>`

Gets a list of all the shares.
Use `path` to show all the shares for that specific file or folder.
Use `includeReshares` to also include shares not belonging to the user.

Use `showForSubFiles` to show the shares of the children instead. This will throw an error if the path is a file.

> `add: (path: string, shareType: OcsShareType, shareWith?: string, permissions?: OcsSharePermissions, password?: string, publicUpload?: boolean):  Promise\<OcsShare\>`

Add a new share.
`shareWith` has to be filled if `shareType` is a `user` or `group`.
Use `permissions` bit-wise to add several permissions. `OcsSharePermissions.default` will let the server decide the permissions.

This will throw an error if the specific share already exists. Use `shares.edit` to edit an existing share.

> `get: (shareId: string | number):  Promise\<OcsShare\>`

Gets the share information.

> `edit (multiple)`

All edit commands will return the edited share.

> `permissions: (shareId: string | number, permissions: OcsSharePermissions):  Promise\<OcsShare\>`

Change the permissions.
Use `permissions` bit-wise to add several permissions.

> `password: (shareId: string | number, password: string):  Promise\<OcsShare\>`

Change the password. Only `OcsShareType.publicLink` uses passwords.

> `publicUpload: (shareId: string | number, isPublicUpload: boolean):  Promise\<OcsShare\>`

Enable / disable public upload for public shares.

> `expireDate: (shareId: string | number, expireDate: string):  Promise\<OcsShare\>`

Add an expire date to the share.
If the expire date is in the past, Nextcloud will remove the share.

> `note: (shareId: string | number, note: string):  Promise\<OcsShare\>`

Add a note to the share.

## Exceptions

### NotFoundError
Error indicating that the requested resource doesn't exist, or that the path leading to it doesn't exist in the case of writes.

### ForbiddenError
Error indicating that Nextcloud denied the request.

### NextcloudError
Generic wrapper for the HTTP errors returned by Nextcloud.

### OcsError
Errors used by all OCS calls.
It will return the reason why a request failed as well as a status code if it is available.

## Types
### ConnectionOptions
```javascript
interface  ConnectionOptions {
  url:        string;
  username?:  string;
  password?:  string;
}
```

### WebDAV
```javascript
interface FileDetails {
    creationDate?: Date;
    lastModified:  Date;
    href:          string;
    name:          string;
    size:          number;
    isDirectory:   boolean;
    isFile:        boolean;
    type:          'directory' | 'file';
}
```

### OCS
```javascript
interface OcsActivity {
  activityId:  number;
  app:         string;
  type:        string;
  user:        string;
  subject:     string;
  subjectRich: [];
  message:     string;
  messageRich: [];
  objectType:  string;
  fileId:      number;
  objectName:  string;
  objects:     {};
  link:        string;
  icon:        string;
  datetime:    Date;
}

interface OcsUser {
  id:          string;
  enabled:     boolean;
  lastLogin:   number;
  email:       string;
  displayname: string;
  phone:       string;
  address:     string;
  website:     string;
  twitter:     string;
  groups:      string[];
  language:    string;
  locale:      string;
}

interface OcsNewUser {
  userid:       string;
  password?:    string;
  email?:       string;
  displayName?: string;
  groups?:      string[];
  subadmin?:    string[];
  quota?:       number;
  language?:    string;
}

type OcsEditUserField =
  'password'    |
  'email'       |
  'displayname' |
  'quota'       |
  'phone'       |
  'address'     |
  'website'     |
  'twitter'     |
  'locale'      |
  'language'    ;

enum OcsShareType {
  user                = 0,
  group               = 1,
  publicLink          = 3,
  federatedCloudShare = 6,
}

enum OcsSharePermissions {
  default = -1,
  read    =  1,
  update  =  2,
  create  =  4,
  delete  =  8,
  share   = 16,
  all     = 31,
}

interface OcsShare {
  id:                    number;
  shareType:             OcsShareType;
  shareTypeSystemName:   string;
  ownerUserId:           string;
  ownerDisplayName:      string;
  permissions:           OcsSharePermissions;
  permissionsText:       string;
  sharedOn:              Date;
  sharedOnTimestamp:     number;
  parent:                string;
  expiration:            Date;
  token:                 string;
  fileOwnerUserId:       string;
  fileOwnerDisplayName:  string;
  note:                  string;
  label:                 string;
  path:                  string;
  itemType:              'file' | 'folder';
  mimeType:              string;
  storageId:             string;
  storage:               number;
  fileId:                number;
  parentFileId:          number;
  fileTarget:            string;
  sharedWith:            string;
  sharedWithDisplayName: string;
  mailSend:              boolean;
  hideDownload:          boolean;
  password?:             string;
  sendPasswordByTalk?:   boolean;
  url?:                  string;
}

type OcsEditShareField =
  'permissions'     |
  'password'        |
  'expireDate'      |
  'note'            ;
```
## Helpers
### createFileDetailProperty(namespace: string, namespaceShort: string, element: string, nativeType?: boolean, defaultValue?: any) : FileDetailProperty
Creates a FileDetailProperty filled in with the supplied arguments, which can be used when using getFolderFileDetails.

### createOwnCloudFileDetailProperty(element: string, nativeType?: boolean, defaultValue?: any) : FileDetailProperty
Uses createFileDetailProperty to request an OwnCloud property.

### createNextCloudFileDetailProperty(element:string, nativeType?: boolean, defaultValue?: any) : FileDetailProperty
Uses createFileDetailProperty to request a NextCloud property.
