# Nextcloud-link

This is the repository for the `nextcloud-link` Javascript/Typescript package, written by [TenTwentyFour S. à r.l.](https://tentwentyfour.lu) . We are in no way affiliated to Nextcloud GmbH, but have been explictly allowed us to use the name `nextcloud-link` for this NPM package.

## Getting started

You can install it from the command-line by doing:

`$ npm i nextcloud-link`

## Current features

 - [x] Interact with Nextcloud instances with WebDav
 - [x] Allows the use of streams for file transfer
 - [x] Test Nextcloud connectivity

There is not yet any support for OCS features, which are coming in a later version.

## API

### configureWebdavConnection(options: ConnectionOptions): void
Configures the Nextcloud connection to talk to a specific Nextcloud WebDav endpoint. This does not issue any kind of request, so it doesn't throw if the parameters are incorrect. This merely sets internal variables.

### checkConnectivity(): Promise\<boolean\>
Checks whether the connection to the configured WebDav endpoint succeeds. This does not throw, it consistently returns a Promise wrapping a boolean.

### pipeStream(path:  string, stream:  Stream.Readable):  Promise\<void\>
Saves the data obtained through `stream` to the Nextcloud instance at `path`.

Throws a `NotFoundError` if the path to the requested directory does not exist.

###  as(username:  string, password:  string):  NextcloudClient
Creates a copy of the client that runs the request as the user with the passed credentials.

This does absolutely no verification, so you should use `checkConnectivity` to verify the credentials.

### createFolderHierarchy(path:  string):  Promise\<void\>
This is basically a recursive `mkdir`.

### put(path:  string, content:  Webdav.ContentType):  Promise\<void\>
This saves a Webdav.ContentType at `path`.

Throws a `NotFoundError` if the path to the requested directory does not exist.

### rename(fromFullPath:  string, toFileName:  string):  Promise\<void\>
This allows to rename files or directories.

### move(fromFullPath:  string, toFullPath:  string):  Promise\<void\>
This allows to move files or entire directories.

### getWriteStream(path:  string):  Promise\<Webdav.Stream\>
Gets a write stream to a remote Nextcloud `path`.

Throws a `NotFoundError` if the path to the requested directory does not exist.

### getReadStream(path:  string):  Promise\<Webdav.Stream\>
Gets a read stream to a remote Nextcloud `path`.

### touchFolder(path:  string):  Promise\<void\>
Smart `mkdir` implementation that doesn't complain if the folder at `path` already exists.

### getFiles(path:  string):  Promise\<string[]\>
List files in a directory.

### getFolderFileDetails(path:  string):  Promise\<FileDetails[]\>
Same as `getFiles`, but returns full details instead of just file names.

### remove(path:  string):  Promise\<void\>
Removes file or directories. Does not complain if directories aren't empty.

### exists(path:  string):  Promise\<boolean\>
Simple test that checks whether a file or directory exists. This indicates it in the return value, not by throwing exceptions.

### get(path:  string):  Promise<string  |  Buffer>
Gets a file as a string/Buffer.

## Exceptions

### NotFoundError
Error indicating that the requested resource doesn't exist, or that the path leading to it doesn't exist in the case of writes.

### ForbiddenError
Error indicating that Nextcloud denied the request.

### NextcloudError
Generic wrapper for the HTTP errors returned by Nextcloud.

## Types
### ConnectionOptions
```
interface  ConnectionOptions {
  url:        string;
  username?:  string;
  password?:  string;
}

export interface FileDetails {
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
