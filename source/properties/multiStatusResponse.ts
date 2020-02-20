import * as cheerio from 'cheerio'

interface PropertyStatus {
  status: string
  properties: object
}

type ResolverFunction = (namespace: string) => string | undefined

class NoPropertyFound implements Error {
  message: 'no property found in part';
  name: 'NoPropertyFound';
}

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

  private static parsePropertyStatus = (propstat: CheerioElement): PropertyStatus => {
    const propStatRoot = cheerio.load(propstat, {xmlMode: true});
    const status = propStatRoot('d\\:status').html();
    const properties = {}
    const propNodes = propStatRoot('d\\:prop')
    if (propNodes.length === 0) {
      throw new NoPropertyFound()
    }
    propNodes.each((index, propNode) => {
      propNode.childNodes.forEach((child: CheerioElement) => {
          if (child.type !== 'text') {
            const value = (child.children && child.children.length > 0 && child.children[0].nodeValue)? child.children[0].nodeValue : ''
            let childName = child.name
            if (childName.startsWith('x1:')) {
              childName = childName.replace('x1:','ocs:')
            }
            properties[childName] = value
          }
      })
    })

    return {
      status,
      properties,
    }
  }

  private static parseResponsePart = ( part: CheerioElement) => {
    const partRoot = cheerio.load(part, {xmlMode: true})
      const href = partRoot('d\\:href').html()
      const propStat:PropertyStatus[] = [];
      partRoot('d\\:propstat').each((index, propstat) => {
        try {
          propStat.push(MultiStatusResponse.parsePropertyStatus(propstat))
        } catch (err) {
          if (!(err instanceof NoPropertyFound)) {
            throw err;
          }
        }
      })
      return new MultiStatusResponse(href, propStat);
    }

  static fromString = (doc: string): MultiStatusResponse[] => {
    const result: MultiStatusResponse[] = []
    const xmlNamespaces: object = MultiStatusResponse.xmlNamespaces
    cheerio.load(doc, {xmlMode: true}).root()
      .find('d\\:response')
      .each(((index, responsePart) => {
        result.push(MultiStatusResponse.parseResponsePart(responsePart))
      }));

    return result
  }



}
