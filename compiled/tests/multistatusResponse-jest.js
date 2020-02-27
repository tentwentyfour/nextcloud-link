"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var multiStatusResponse_1 = require("../source/properties/multiStatusResponse");
jest.setTimeout(20000);
describe('fromString', function () {
    var xml = "\n    <?xml version='1.0' encoding='UTF-8'?>\n  <d:multistatus xmlns:d='DAV:'\n  xmlns:nc='http://nextcloud.org/ns'\n  xmlns:oc='http://owncloud.org/ns'\n  xmlns:s='http://sabredav.org/ns'>\n    <d:response>\n  <d:href>/remote.php/dav/files/matchish/project1/</d:href>\n  <d:propstat>\n     <d:prop>\n      <d:getlastmodified>Wed, 22 Jan 2020 04:31:10 GMT</d:getlastmodified>\n      <oc:fileid>307</oc:fileid>\n      <nc:has-preview>false</nc:has-preview>\n      <x1:share-permissions xmlns:x1='http://open-collaboration-services.org/ns'>31</x1:share-permissions>\n    </d:prop>\n    <d:status>HTTP/1.1 200 OK</d:status>\n  </d:propstat>\n  <d:propstat>\n   <d:prop>\n     <d:getcontenttype />\n      <d:getcontentlength />\n   </d:prop>\n    <d:status>HTTP/1.1 404 Not Found</d:status>\n  </d:propstat>\n  </d:response>\n  </d:multistatus>\n  ";
    it('should parse responses', function () {
        var response = multiStatusResponse_1.MultiStatusResponse.fromString(xml);
        expect(response).toHaveLength(1);
    });
    it('should parse href', function () {
        var response = multiStatusResponse_1.MultiStatusResponse.fromString(xml);
        expect(response[0].href).toEqual('/remote.php/dav/files/matchish/project1/');
    });
    it('should parse stats of properties', function () {
        var response = multiStatusResponse_1.MultiStatusResponse.fromString(xml);
        expect(response[0].propStat).toHaveLength(2);
        expect(response[0].propStat[0].status).toEqual('HTTP/1.1 200 OK');
        expect(response[0].propStat[1].status).toEqual('HTTP/1.1 404 Not Found');
        var response0propStat0propertiesLength = Object.keys(response[0].propStat[0].properties).length;
        expect(response0propStat0propertiesLength).toEqual(4);
        expect(response[0].propStat[0].properties['d:getlastmodified']).toEqual('Wed, 22 Jan 2020 04:31:10 GMT');
        expect(response[0].propStat[0].properties['nc:has-preview']).toEqual('false');
        expect(response[0].propStat[0].properties['oc:fileid']).toEqual('307');
        expect(response[0].propStat[0].properties['ocs:share-permissions']).toEqual('31');
        var response0propStat1propertiesLength = Object.keys(response[0].propStat[1].properties).length;
        expect(response0propStat1propertiesLength).toEqual(2);
        expect(response[0].propStat[1].properties['d:getcontentlength']).toEqual('');
        expect(response[0].propStat[1].properties['d:getcontenttype']).toEqual('');
    });
});
//# sourceMappingURL=multistatusResponse-jest.js.map