import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';

import {Tag} from './tag';
// import {MultiStatusResponse} from './multiStatusResponse';
import {FileProps} from './fileProps';
import { NotFoundError } from '../errors';
import * as assert from 'assert';
import {MultiStatusResponse} from './multiStatusResponse';

const  NOT_FOUND = '404';
const TAG_DISPLAY_NAME = 'oc:display-name'

export class PropertiesClient {

  readonly connection: AxiosInstance
  constructor(private readonly baseURL: string, private readonly username: string, password: string) {
    const auth = {
      username,
      password,
    }
    const config: AxiosRequestConfig = {
      auth,
      baseURL: `${baseURL}/remote.php/dav/`
      // headers: { Authorization: `Bearer ${token}` },
    }
     this.connection = axios.create(config)
  }

  getUserFilePath = (path: string) => `files/${this.username}${path}`

  getFileId = async (path: string):  Promise<string | void> => {
    try {
      const fileprops: FileProps = await this.getFileProps(
        path,
      );
      const fileId = fileprops.getProperty('oc:fileid')
      return fileId;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return;
      }
      throw error;
    }
  }

  addTag = async (fileId: number | string, tag: Tag): Promise<void> => {
    await this.connection.request({
      method: 'PUT',
      url: `/systemtags-relations/files/${fileId}/${tag.id}`,
    }) ;
  }

  removeTag = async (fileId: number | string, tag: Tag) => {
    await this.connection.request({
      method: 'DELETE',
      url: `/systemtags-relations/files/${fileId}/${tag.id}`,
    })
  }

  getTags = async (fileId: number | string): Promise<Tag[]> => {
    const url = `/systemtags-relations/files/${fileId}`
    const responses = await this.callPropFind(url, ['oc:display-name', 'oc:id'])
    return responses.reduce((carry: Tag[], item: MultiStatusResponse) => {
      if (
        item.propStat.length === 0 ||
        item.propStat[0].status !== 'HTTP/1.1 200 OK'
      ) {
        return carry
      }

      const tag = new Tag(
        item.propStat[0].properties['oc:id'],
        item.propStat[0].properties['oc:display-name'],
      )
      carry.push(tag)
      return carry
    }, [])
  }

  getFileProps = async (
    path: string,
    names: string[] = [
      'd:getlastmodified',
      'd:getetag',
      'd:getcontenttype',
      'd:resourcetype',
      'oc:fileid',
      'oc:permissions',
      'oc:size',
      'd:getcontentlength',
      'nc:has-preview',
      'nc:mount-type',
      'nc:is-encrypted',
      'ocs:share-permissions',
      'oc:tags',
      'oc:favorite',
      'oc:comments-unread',
      'oc:owner-id',
      'oc:owner-display-name',
      'oc:share-types',
      'oc:share-types',
      'oc:foreign-id',
    ],
  ): Promise<FileProps> => {
    const absolutePath = this.getUserFilePath(path)
    const responses = await this.callPropFind(absolutePath, names)
    const response: MultiStatusResponse = responses[0]
    if (
      response.propStat.length === 0 ||
      response.propStat[0].status !== 'HTTP/1.1 200 OK'
    ) {
      throw new NotFoundError(absolutePath)
    }
    const props = Object.keys(response.propStat[0].properties).reduce(
      (carry, key) => {
        const name: string = key.replace('{http://owncloud.org/ns}', '')
        carry[name] = response.propStat[0].properties[key]
        return carry
      },
      {},
    )
    return new FileProps(absolutePath, props)
  }

  saveProps = async (fileProps: FileProps) => {
    const rawResponse = await this.connection.request({
      // @ts-ignore axios doesn't have PROPPATCH method
      method: 'PROPPATCH',
      url: fileProps.path,
      data: `<?xml version="1.0"?>
            <d:propertyupdate  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
            ${fileProps
        .dirty()
        .map(
          // tslint:disable-next-line
          prop => `<d:set>
              <d:prop>
                <${prop.name}>${prop.value}</${prop.name}>
              </d:prop>
            </d:set>`,
        )
        .join('')}</d:propertyupdate>`,
    })

    const responses: MultiStatusResponse[] = this.parseMultiStatus(
      rawResponse.data,
    )
    const response = responses[0]
    if (
      response.propStat.length === 0 ||
      response.propStat[0].status !== 'HTTP/1.1 200 OK'
    ) {
      throw new Error(
        `Can't update properties of file ${fileProps.path}. ${response.propStat[0].status}`,
      )
    }
  }

  private callPropFind = async (
    path: string,
    names: string[],
  ): Promise<MultiStatusResponse[]> => {
    try {
      const rawResponse = await this.connection.request({
        // @ts-ignore axios doesn't have PROPFIND method
        method: 'PROPFIND',
        url: path,
        data: `<?xml version="1.0"?>
				<d:propfind  xmlns:d="DAV:"
					xmlns:oc="http://owncloud.org/ns"
					xmlns:nc="http://nextcloud.org/ns"
					xmlns:ocs="http://open-collaboration-services.org/ns">
                <d:prop>
                    ${
          // tslint:disable-next-line
          names.map(name => `<${name} />`).join('')
        }
				</d:prop>
				</d:propfind>`,
      })
      return this.parseMultiStatus(rawResponse.data)

    } catch (err) {
      if (err && err.response && err.response.status === 404) {
        throw new NotFoundError(path)
      }
      throw err
    }
  }

   createTag = async (name: string): Promise<Tag> => {
    const response = await this.connection.request({
      method: 'POST',
      url: '/systemtags',
      data: {
        name,
        userVisible: true,
        userAssignable: true,
        canAssign: true,
      },
    })
    const url = response.headers['content-location']
    const id = this.parseIdFromLocation(url)
    return new Tag(id, name)
  }

  getTag = async (tagId: string): Promise<Tag | void> => {
    try {
      const response = await this.callPropFind(`/systemtags/${tagId}`, [TAG_DISPLAY_NAME])
      if (response.length < 1) {
        return
      }
      if (response[0].propStat.length < 1) {
        return
      }
      if (! response[0].propStat[0].status) {
        return
      }
      if (response[0].propStat[0].status.includes(NOT_FOUND)) {
        return
      }
      if (! response[0].propStat[0].properties) {
        return
      }
      if (! response[0].propStat[0].properties[TAG_DISPLAY_NAME]) {
        return
      }
      const tagName = response[0].propStat[0].properties[TAG_DISPLAY_NAME]
      return new Tag(tagId, tagName)
    } catch(err) {
      console.error(err)
    }

  }

  getAllTags = async (): Promise<Tag[]> => {
    const resp = await this.callPropFind('/systemtags/', [])
    const result = []
    await Promise.all(resp.map(async (tagProp: {href:string}) => {
      const tagId = this.parseIdFromLocation(tagProp.href);
      if(tagId !== 'systemtags') {
        result.push(await this.getTag(this.parseIdFromLocation(tagProp.href)))
      }
    }))
    return result
}

  deleteTag = async (tag: Tag): Promise<boolean> => {
    try {
      const response = await this.connection.request({
        method: 'DELETE',
        url: `/systemtags/${tag.id}`
      })
      return true
    } catch (err) {
      return false
    }

  }

  private parseIdFromLocation = (url: string): string => {
    const queryPos = url.indexOf('?')
    let cleanUrl = url
    if (queryPos > 0) {
      cleanUrl = url.substr(0, queryPos)
    }
    const parts = url.split('/')
    let result
    do {
      result = parts[parts.length - 1]
      parts.pop()
    } while (!result && parts.length > 0)

    return result
  }

  private parseMultiStatus = (doc: string): MultiStatusResponse[] => {
    return MultiStatusResponse.fromString(doc)
  }
}
