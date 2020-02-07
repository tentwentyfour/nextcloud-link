import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';
import {Tag} from './tag';
import {MultiStatusResponse} from './multiStatusResponse';
import {FileProps} from './fileProps';
import { NotFoundError } from '../errors';

export class PropertiesClient {
  readonly connection: AxiosInstance

  constructor(baseURL: string, username: string, password: string) {
    const auth = {
      username,
      password,
    }
    const config: AxiosRequestConfig = {
      baseURL,
      // headers: { Authorization: `Bearer ${token}` },
      auth
    }
    this.connection = axios.create(config)
  }

  getFileId = async (path: string):  Promise<string> => {
    const fileprops: FileProps = await this.getFileProps(
      path,
    );
    return fileprops.property('oc:fileid')
  }

  addTag = async (fileId: number | string, tag: Tag): Promise<void> => {
    await this.connection({
      method: 'PUT',
      url: `/systemtags-relations/files/${fileId}/${tag.id}`,
    }) ;
  }

  removeTag = async (fileId: number | string, tag: Tag) => {
    await this.connection({
      method: 'DELETE',
      url: `/systemtags-relations/files/${fileId}/${tag.id}`,
    })
  }

  getTags = async (fileId: number | string): Promise<Tag[]> => {
    const url = `/systemtags-relations/files/${fileId}`
    const responses = await this._props(url, ['oc:display-name', 'oc:id'])
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
    const responses = await this._props(path, names)
    const response: MultiStatusResponse = responses[0]
    if (
      response.propStat.length === 0 ||
      response.propStat[0].status !== 'HTTP/1.1 200 OK'
    ) {
      throw new NotFoundError(path)
    }
    const props = Object.keys(response.propStat[0].properties).reduce(
      (carry, key) => {
        const name: string = key.replace('{http://owncloud.org/ns}', '')
        carry[name] = response.propStat[0].properties[key]
        return carry
      },
      {},
    )
    return new FileProps(path, props)
  }

  saveProps = async (fileProps: FileProps) => {
    // @ts-ignore axios doesn't have PROPPATCH method
    const rawResponse = await this.connection({
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

    const responses: MultiStatusResponse[] = this._parseMultiStatus(
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

  private _props = async (
    path: string,
    names: string[],
  ): Promise<MultiStatusResponse[]> => {
    // @ts-ignore axios doesn't have PROPFIND method
    const rawResponse = await this.connection({
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
    return this._parseMultiStatus(rawResponse.data)
  }

   createTag = async (name: string): Promise<Tag> => {
    const response = await this.connection({
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
    const id = this._parseIdFromLocation(url)
    return new Tag(id, name)
  }

  private _parseIdFromLocation = (url: string): string => {
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

  private _parseMultiStatus = (doc: string): MultiStatusResponse[] => {
    return MultiStatusResponse.fromString(doc)
  }
}
