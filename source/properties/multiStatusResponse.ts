import { JSDOM } from 'jsdom';
const DOMParser = new JSDOM().window.DOMParser;

interface PropertyStatus {
  status: string
  properties: object
}

type ResolverFunction = (namespace: string) => string | undefined

export class MultiStatusResponse {
  static xmlNamespaces: object = {
    'DAV:': 'd',
    'http://owncloud.org/ns': 'oc',
    'http://nextcloud.org/ns': 'nc',
    'http://open-collaboration-services.org/ns': 'ocs',
  }

  constructor(
    public href: string | null,
    public propStat: PropertyStatus[],
  ) {}

  static fromString = (doc: string): MultiStatusResponse[] => {
    const result: MultiStatusResponse[] = []
    const xmlNamespaces: object = MultiStatusResponse.xmlNamespaces
    const resolver: ResolverFunction = (namespace: string) => {
      let ii: string
      for (ii in xmlNamespaces) {
        if (xmlNamespaces[ii] === namespace) {
          return ii
        }
      }
      return undefined
    }

    const responses = MultiStatusResponse._getElementsByTagName(
      doc,
      'd:response',
      resolver,
    )
    for (let i = 0; i < responses.length; i++) {
      const responseNode: any = responses[i]
      const response = new MultiStatusResponse(null, [])

      const hrefNode: any = MultiStatusResponse._getElementsByTagName(
        responseNode,
        'd:href',
        resolver,
      )[0]

      response.href = hrefNode.textContent || hrefNode.text

      const propStatNodes = MultiStatusResponse._getElementsByTagName(
        responseNode,
        'd:propstat',
        resolver,
      )

      for (let j = 0; j < propStatNodes.length; j++) {
        const propStatNode: any = propStatNodes[j]
        const statusNode: any = MultiStatusResponse._getElementsByTagName(
          propStatNode,
          'd:status',
          resolver,
        )[0]

        const propStat: PropertyStatus = {
          status: statusNode.textContent || statusNode.text,
          properties: {},
        }

        const propNode: any = MultiStatusResponse._getElementsByTagName(
          propStatNode,
          'd:prop',
          resolver,
        )[0]
        if (!propNode) {
          continue
        }
        for (let k = 0; k < propNode.childNodes.length; k++) {
          const prop: any = propNode.childNodes[k]
          if (prop.nodeName === '#text') {
            continue
          }
          const value: any = MultiStatusResponse._parsePropNode(prop)
          const namespace: string =
            MultiStatusResponse.xmlNamespaces[prop.namespaceURI] ||
            prop.namespaceURI
          propStat.properties[
            `${namespace}:${prop.localName || prop.baseName}`
            ] = value
        }
        response.propStat.push(propStat)
      }

      result.push(response)
    }

    return result
  }

  private static _parsePropNode = (e: any): string => {
    let t: any[] | null = null
    if (e.childNodes && e.childNodes.length > 0) {
      const n: any[] = []
      for (let r = 0; r < e.childNodes.length; r++) {
        const i: any = e.childNodes[r]
        if (1 === i.nodeType) {
          n.push(i)
        }
      }
      if (n.length) {
        t = n
      }
    }
    return t || e.textContent || e.text || ''
  }

  private static _getElementsByTagName = (
    node: Document | string,
    name: string,
    resolver: ResolverFunction,
  ): HTMLCollectionOf<Element> => {
    const parts: string[] = name.split(':')
    const tagName: string = parts[1]
    // @Sergey what to do here? namespace could be undefined, I put in a naive fix..
    const namespace: string = resolver(parts[0]) || ''
    if (typeof node === 'string') {
      const parser: DOMParser = new DOMParser()
      node = parser.parseFromString(node, 'text/xml')
    }
    if (node.getElementsByTagNameNS) {
      return node.getElementsByTagNameNS(namespace, tagName)
    }
    return node.getElementsByTagName(name)
  }
}
