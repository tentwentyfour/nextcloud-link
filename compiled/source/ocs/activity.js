"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var querystring = require("querystring");
var req = require("request");
var baseUrl = 'ocs/v2.php/apps/activity/api/v2/activity';
function ocsGetActivities(fileId, sort, limit, sinceActivityId, callback) {
    var self = this;
    var params = {
        format: 'json',
        object_type: 'files',
        object_id: fileId,
        sort: (sort === 'asc' ? 'asc' : 'desc')
    };
    if (limit > 0) {
        params['limit'] = limit;
    }
    if (sinceActivityId > 0) {
        params['since'] = sinceActivityId;
    }
    var urlParams = querystring.stringify(params);
    req({
        url: self.options.url + "/" + baseUrl + "/filter?" + urlParams,
        headers: self.getHeader()
    }, function (error, response, body) {
        self.request(error, response, body, function (error, body) {
            var activities = [];
            if (!error && body && body.data && body.data.length > 0) {
                body.data.forEach(function (activity) {
                    activities.push({
                        activityId: parseInt(activity.activity_id, 10),
                        app: activity.app,
                        type: activity.type,
                        user: activity.user,
                        subject: activity.subject,
                        subjectRich: activity.subject_rich,
                        message: activity.message,
                        messageRich: activity.message_rich,
                        objectType: activity.object_type,
                        fileId: activity.objectId,
                        objectName: activity.object_name,
                        objects: activity.objects,
                        link: activity.link,
                        icon: activity.icon,
                        datetime: activity.datetime
                    });
                });
            }
            callback(error, activities);
        });
    });
}
exports.ocsGetActivities = ocsGetActivities;
//# sourceMappingURL=activity.js.map