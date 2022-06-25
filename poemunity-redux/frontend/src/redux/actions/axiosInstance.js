import Axios from 'axios';

export default function API(headers, extraConfig) {
    return Axios.create({
        // baseURL: `${process.env.API_BASE_PATH}`,
        timeout: 40000,
        headers,
        ...extraConfig,
    });
}
