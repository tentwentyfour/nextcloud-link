import { req } from '../requestWrapper';
const baseUrl = 'ocs/v2.php/apps/activity/api/v2/activity';
export function ocsGetActivities(fileId, sort, limit, sinceActivityId, callback) {
    const self = this;
    const params = {
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
    const urlParams = new URLSearchParams(params)
        .toString();
    req({
        url: `${self.options.url}/${baseUrl}/filter?${urlParams}`,
        headers: self.getHeader()
    }, (error, response, body) => {
        self.request(error, response, body, (error, body) => {
            let activities = [];
            if (!error && body && body.data && body.data.length > 0) {
                body.data.forEach(activity => {
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