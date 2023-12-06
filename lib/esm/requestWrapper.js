import axios from 'axios';
export function req(options, callback) {
    axios({
        method: 'GET',
        validateStatus: () => true,
        ...options
    })
        .then(async (response) => {
        callback(null, response, response?.data);
    })
        .catch((error) => {
        callback(error, null, null);
    });
}
