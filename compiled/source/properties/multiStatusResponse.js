"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require("cheerio");
var NoPropertyFound = /** @class */ (function () {
    function NoPropertyFound() {
    }
    return NoPropertyFound;
}());
var MultiStatusResponse = /** @class */ (function () {
    function MultiStatusResponse(href, propStat) {
        this.href = href;
        this.propStat = propStat;
    }
    MultiStatusResponse.xmlNamespaces = {
        'DAV:': 'd',
        'http://owncloud.org/ns': 'oc',
        'http://nextcloud.org/ns': 'nc',
        'http://open-collaboration-services.org/ns': 'ocs',
    };
    MultiStatusResponse.parsePropertyStatus = function (propstat) {
        var propStatRoot = cheerio.load(propstat, { xmlMode: true });
        var status = propStatRoot('d\\:status').html();
        var properties = {};
        var propNodes = propStatRoot('d\\:prop');
        if (propNodes.length === 0) {
            throw new NoPropertyFound();
        }
        propNodes.each(function (index, propNode) {
            propNode.childNodes.forEach(function (child) {
                if (child.type !== 'text') {
                    var value = (child.children && child.children.length > 0 && child.children[0].nodeValue) ? child.children[0].nodeValue : '';
                    var childName = child.name;
                    if (childName.startsWith('x1:')) {
                        childName = childName.replace('x1:', 'ocs:');
                    }
                    properties[childName] = value;
                }
            });
        });
        return {
            status: status,
            properties: properties,
        };
    };
    MultiStatusResponse.parseResponsePart = function (part) {
        var partRoot = cheerio.load(part, { xmlMode: true });
        var href = partRoot('d\\:href').html();
        var propStat = [];
        partRoot('d\\:propstat').each(function (index, propstat) {
            try {
                propStat.push(MultiStatusResponse.parsePropertyStatus(propstat));
            }
            catch (err) {
                if (!(err instanceof NoPropertyFound)) {
                    throw err;
                }
            }
        });
        return new MultiStatusResponse(href, propStat);
    };
    MultiStatusResponse.fromString = function (doc) {
        var result = [];
        var xmlNamespaces = MultiStatusResponse.xmlNamespaces;
        cheerio.load(doc, { xmlMode: true }).root()
            .find('d\\:response')
            .each((function (index, responsePart) {
            result.push(MultiStatusResponse.parseResponsePart(responsePart));
        }));
        return result;
    };
    return MultiStatusResponse;
}());
exports.MultiStatusResponse = MultiStatusResponse;
//# sourceMappingURL=multiStatusResponse.js.map