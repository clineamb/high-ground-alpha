// ========= HASH RELATED
/**
 * return the hash from a URL string
 * @param {String} url
 * @return {String}
 */
function getHash(url) {
  url = url + ''; // Convert object to string, if necessary
  if (url.indexOf('#') > -1) {
    return url.substr(url.indexOf('#'), url.length);
  }
  return '';
}

/**
 * removes the hash from a query string
 * @param {String} url
 * @return {String}
 */
function removeHash(url) {
  url = url + ''; // Convert object to string, if necessary
  if (url.indexOf('#') > -1) {
    return url.substr(0, url.indexOf('#'));
  }
  return url;
}

// ========= QUERY STRING RELATED
/**
 * return true if URL has a query string.
 * doesn't use `includes` b/c IE11
 * @param {String} url
 * @return {String}
 */
function hasQueryString(url) {
  return url.indexOf('?') > -1;
}

/**
 * return the entire query paramater as a string
 * @param {String} url
 * @return {String}
 */
function getQueryString(url) {
  url = removeHash(url);
  let querystring = '';
  if (hasQueryString(url)) {
    querystring = url.substr(url.indexOf('?'), url.length); // Contains '?'
  }
  return querystring;
}

/**
 * return a url string w/o the query string that was appended
 * @param {String} url
 * @return {String}
 */
function removeQueryString(url) {
  if (!hasQueryString(url)) {
    return url;
  }
  const hash = getHash(url); // Convert object to string, if necessary
  url = removeHash(url);
  return url.substr(0, url.indexOf('?')) + hash;
}

// ========= QS <> Object

/**
 * turns a query string into a key/value object
 * @param {String} qs
 * @return {Object}
 */
function queryStringToObject(qs) {
  if (qs === '' || qs === undefined || qs === null) {
    return {};
  }
  // remove ? just in case
  if (qs.indexOf('?') > -1) {
    qs = qs.substr(qs.indexOf('?') + 1, qs.length);
  }
  qs = removeHash(qs);
  const params = qs.split('&');
  const obj = {};
  params.forEach((pair) => {
    let [ key, value = null ] = pair.split('=');
    obj[key] = value;
  });
  return obj;
}

/**
 * turns key/val object into a query string, prepended by a prefix
 * @param {String} obj
 * @param {String} prefix (optional) - what to prepend the string with, default ?
 * @return {String}
 */
function objectToQueryString(obj, prefix = '?') {
  let strArr = [];
  Object.keys(obj).forEach((key) => {
    strArr.push(`${key}=${encodeURIComponent(obj[key])}`);
  });
  return (prefix || '') + strArr.join('&');
}

// alias
const parameterize = objectToQueryString;

/**
 * takes a URL and returns an object given its query paramters
 * @param {String} url
 * @return {Object}
 */
function urlQueryToObject(url) {
  const qs = getQueryString(url);
  return queryStringToObject(qs);
}

// ========= URL MODIFIERS

/**
 * return just the URL w/o query string or hash
 * @param {String} url
 * @return {String}
 */
function getBaseUrl(url) {
  url = removeHash(url);
  url = removeQueryString(url);
  return url;
}

/**
 * return an assembled URL with specified params from `keyValObj`
 * will overwrite existing keys with new value
 * @param {*} url
 * @param {*} keyValObj - { keyName: value }
 * @return {String}
 */
function addParams(url, keyValObj) {
  const qsObj = urlQueryToObject(url);
  const hash = getHash(url);
  url = getBaseUrl(url);
  // can't use assign for IE
  Object.keys(keyValObj).forEach((key) => {
    qsObj[key] = keyValObj[key];
  });
  return `${url}${objectToQueryString(qsObj)}${hash}`;
}

/**
 * Remove given parameters from a URL string.
 * @param {String} url - a url
 * @param {Array} keys - an array of keys to be deleted
 * @return {String} url - the url without the given params
 */
function removeParams(url, keys) {
  const qsObj = urlQueryToObject(url);
  const hash = getHash(url);
  url = getBaseUrl(url);
  keys.forEach((key) => {
    delete qsObj[key];
  });
  return `${url}${objectToQueryString(qsObj)}${hash}`;
}

export default {
  getHash,
  removeHash,
  hasQueryString,
  getQueryString,
  removeQueryString,
  queryStringToObject,
  objectToQueryString,
  parameterize,
  urlQueryToObject,
  getBaseUrl,
  addParams,
  removeParams
};