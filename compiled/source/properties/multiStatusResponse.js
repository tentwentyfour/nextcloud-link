"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom_1 = require("jsdom");
var DOMParser = new jsdom_1.JSDOM().window.DOMParser;
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
    MultiStatusResponse.fromString = function (doc) {
        var result = [];
        var xmlNamespaces = MultiStatusResponse.xmlNamespaces;
        var resolver = function (namespace) {
            var ii;
            for (ii in xmlNamespaces) {
                if (xmlNamespaces[ii] === namespace) {
                    return ii;
                }
            }
            return undefined;
        };
        var responses = MultiStatusResponse.getElementsByTagName(doc, 'd:response', resolver);
        for (var i = 0; i < responses.length; i++) {
            var responseNode = responses[i];
            var response = new MultiStatusResponse(null, []);
            var hrefNode = MultiStatusResponse.getElementsByTagName(responseNode, 'd:href', resolver)[0];
            response.href = hrefNode.textContent || hrefNode.text;
            var propStatNodes = MultiStatusResponse.getElementsByTagName(responseNode, 'd:propstat', resolver);
            for (var j = 0; j < propStatNodes.length; j++) {
                var propStatNode = propStatNodes[j];
                var statusNode = MultiStatusResponse.getElementsByTagName(propStatNode, 'd:status', resolver)[0];
                var propStat = {
                    status: statusNode.textContent || statusNode.text,
                    properties: {},
                };
                var propNode = MultiStatusResponse.getElementsByTagName(propStatNode, 'd:prop', resolver)[0];
                if (!propNode) {
                    continue;
                }
                for (var k = 0; k < propNode.childNodes.length; k++) {
                    var prop = propNode.childNodes[k];
                    if (prop.nodeName === '#text') {
                        continue;
                    }
                    var value = MultiStatusResponse.parsePropNode(prop);
                    var namespace = MultiStatusResponse.xmlNamespaces[prop.namespaceURI] ||
                        prop.namespaceURI;
                    propStat.properties[namespace + ":" + (prop.localName || prop.baseName)] = value;
                }
                response.propStat.push(propStat);
            }
            result.push(response);
        }
        return result;
    };
    MultiStatusResponse.parsePropNode = function (e) {
        var t = null;
        if (e.childNodes && e.childNodes.length > 0) {
            var n = [];
            for (var r = 0; r < e.childNodes.length; r++) {
                var i = e.childNodes[r];
                if (1 === i.nodeType) {
                    n.push(i);
                }
            }
            if (n.length) {
                t = n;
            }
        }
        return t || e.textContent || e.text || '';
    };
    MultiStatusResponse.getElementsByTagName = function (input, name, resolver) {
        var node;
        var parts = name.split(':');
        var tagName = parts[1];
        // @Sergey what to do here? namespace could be undefined, I put in a naive fix..
        var namespace = resolver(parts[0]) || '';
        if (typeof input === 'string') {
            var parser = new DOMParser();
            node = parser.parseFromString(input, 'text/xml');
        }
        else {
            node = input;
        }
        if (node.getElementsByTagNameNS) {
            return node.getElementsByTagNameNS(namespace, tagName);
        }
        return node.getElementsByTagName(name);
    };
    return MultiStatusResponse;
}());
exports.MultiStatusResponse = MultiStatusResponse;
//# sourceMappingURL=multiStatusResponse.js.map