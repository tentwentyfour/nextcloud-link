import { MultiStatusResponse } from '../source/properties/multiStatusResponse'
jest.setTimeout(20000)

describe('fromString', () => {
  const xml = `
    <?xml version='1.0' encoding='UTF-8'?>
  <d:multistatus xmlns:d='DAV:'
  xmlns:nc='http://nextcloud.org/ns'
  xmlns:oc='http://owncloud.org/ns'
  xmlns:s='http://sabredav.org/ns'>
    <d:response>
  <d:href>/remote.php/dav/files/matchish/project1/</d:href>
  <d:propstat>
     <d:prop>
      <d:getlastmodified>Wed, 22 Jan 2020 04:31:10 GMT</d:getlastmodified>
      <oc:fileid>307</oc:fileid>
      <nc:has-preview>false</nc:has-preview>
      <x1:share-permissions xmlns:x1='http://open-collaboration-services.org/ns'>31</x1:share-permissions>
    </d:prop>
    <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
  <d:propstat>
   <d:prop>
     <d:getcontenttype />
      <d:getcontentlength />
   </d:prop>
    <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
  </d:response>
  </d:multistatus>
  `
  it('should parse responses', () => {
    const response = MultiStatusResponse.fromString(xml)
    expect(response).toHaveLength(1)
  })

  it('should parse href', () => {
     const response = MultiStatusResponse.fromString(xml)

    expect(response[0].href).toEqual('/remote.php/dav/files/matchish/project1/')
  })

  it('should parse stats of properties', () => {
     const response = MultiStatusResponse.fromString(xml)
    expect(response[0].propStat).toHaveLength(2)
    expect(response[0].propStat[0].status).toEqual('HTTP/1.1 200 OK')
    expect(response[0].propStat[1].status).toEqual('HTTP/1.1 404 Not Found')
    const response0propStat0propertiesLength = Object.keys(response[0].propStat[0].properties).length
    expect(response0propStat0propertiesLength).toEqual(4)
    expect(response[0].propStat[0].properties[ 'd:getlastmodified']).toEqual(
 'Wed, 22 Jan 2020 04:31:10 GMT');
      expect(response[0].propStat[0].properties['nc:has-preview']).toEqual('false');
      expect(response[0].propStat[0].properties['oc:fileid']).toEqual('307');
      expect(response[0].propStat[0].properties['ocs:share-permissions']).toEqual('31');
      const response0propStat1propertiesLength =  Object.keys(response[0].propStat[1].properties).length;
    expect(response0propStat1propertiesLength).toEqual(2)

    expect(response[0].propStat[1].properties['d:getcontentlength']).toEqual('')
    expect(response[0].propStat[1].properties['d:getcontenttype']).toEqual('')


  })

})
import { format } from 'path'
