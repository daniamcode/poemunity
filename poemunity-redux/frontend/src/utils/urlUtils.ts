import { useEffect, useState } from 'react';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

export function parseQuery(url: string = window.location.search) {
    const urlParams = new URLSearchParams(url);
    return Array.from(urlParams.keys()).reduce((acc, key) => {
        if (key !== '__proto__') {
            // we use non-null assertion operator by now to bypass typescript's error 
            acc[key] = urlParams.has(key) ? JSON.parse(urlParams.get(key)!) : null;
        }
        return acc;
    }, {});
}

export function urlParse(url = '') {
    const protocol = url.split('://')[0];
    const host = url.split('://')[1].split('/')[0];
    const splitUrl = url.split('/');
    const tail = splitUrl[splitUrl.length - 1];
    return {
        protocol,
        host,
        tail,
    };
}

export function urlTail(url = '') {
    const { tail } = urlParse(url);
    return tail;
}

/**
 * @description Sets a new query param into the url or updates an existing one.
 * @param {string} id - Query key id to be set or updated
 * @param {any} value - Query value to be assigned
 */

interface addQueryParamProps {
    id: string;
    value: string;
}

export function addQueryParam({ id, value }: addQueryParamProps) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const parsedValue = JSON.stringify(value);
        urlParams.set(id, parsedValue);
        history.push({
            search: urlParams.toString(),
            pathname: history.location.pathname,
        });
    } catch (error: any) {
        console.error(error.stack);
    }
}

/**
 * @description Sets a new query param into the url or updates an existing one.
 * @param {array} data - Query key id to be set or updated.
 * @param {array} keysToDelete - An array of keys to delete.
 */
export function addQueryParams(data: {key: string, value: string}[], keysToDelete: string[]) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        keysToDelete.forEach(key => urlParams.delete(key));
        console.log(keysToDelete);
        data.forEach(({ key, value }) => {
            const parsedValue = JSON.stringify(value);
            console.log(`Adding key ${key} with value ${parsedValue}`);
            urlParams.set(key, parsedValue);
        });
        const newQuery = urlParams.toString();
        if (newQuery !== window.location.search) {
            history.push({
                search: urlParams.toString(),
                pathname: history.location.pathname,
            });
        }
    } catch (error:any) {
        console.error(error.stack);
    }
}

export function getQueryParam(key: string) {
    const result = parseQuery()
    // check this typescript's type assertion
    const { [key as keyof typeof result]: value } = result;
    return value;
}

export function decodeRedirectQuery(query = '') {
    const urlParams = new URLSearchParams(query);
    const encodedQuery = urlParams.toString();
    const decodedQuery = encodedQuery
        .split('%3F')
        .join('?')
        .split('%3D')
        .join('=')
        .split('%26')
        .join('&');
    return decodedQuery;
}

/**
 * @description A hook to manage filters that load data from url query
 * @param {object} defaultValue - The object with the properties
 */
export function useFiltersFromQuery(defaultValue: any) {
    const [data, setData] = useState(defaultValue);
    useEffect(() => {
        const keys = Object.keys(defaultValue);
        const accumulatedQuery = {};
        keys.forEach((key) => {
            const value = getQueryParam(key);
            if (value !== undefined) {
                accumulatedQuery[key] = value;
            }
        });
        setData({
            ...data,
            ...accumulatedQuery,
        });
    }, []);
    useEffect(() => {
        const keysData = Object.keys(data).map(key => ({ key, value: data[key] }));
        const keysToDelete: string[] = [];
        const filteredData = keysData.filter(({ key, value }) => {
            const currentValue = getQueryParam(key);
            const isNewValue = currentValue !== value;
            const isDefaultValue = value === defaultValue[key];
            const isValidValue = value !== null && value !== undefined;
            if (isDefaultValue || !isValidValue) {
                keysToDelete.push(key);
            }
            return isNewValue && !isDefaultValue && isValidValue;
        });
        const totalKeys = filteredData.length + keysToDelete.length;
        if (totalKeys >= 1) {
            addQueryParams(filteredData, keysToDelete);
        }
    }, [JSON.stringify(data)]);
    return [data, setData];
}

export function queryMatch(key: string, value: string) {
    return getQueryParam(key) === value;
}

export function getEncodedUri(rawUri: string) {
    return encodeURI(rawUri);
}
