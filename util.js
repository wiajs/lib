/**
 * Created by way on 16/6/10.
 */

export function trim(s) {
  return s == null ? '' : String(s).replace(/(^\s*)|(\s*$)/g, '');
}

/**
 * 格式化字符串，类似 node util中带的 format
 * @type {Function}
 */
export function format(f, ...args) {
  let i = 0;
  const len = args.length;
  const str = String(f).replace(/%[sdj%]/g, x => {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });

  return str;
}

export function jsons(json) {
  return JSON.stringify(json);
}

export function json(str) {
  try {
    str = str.replace(/'/g, '"');
    return JSON.parse(str);
  } catch (e) {
    console.log(e);
  }
}

export function urlParam(name) {
  let rc = null;

  if (!location.search)
    return null;

  let val = decodeURIComponent(location.search).substr(1);
  val = `&${val}&`;
  const rg = new RegExp(`&\\s*${name}\\s*=\\s*([^&]*)&`, 'gi');
  const rgs = rg.exec(val);
  if (rgs) {
    rc = rgs[1];
    rc = trim(rc);
  }

  return rc;
}

/**
 * 获取 url 的 fragment（即 hash 中去掉 # 的剩余部分）
 *
 * 如果没有则返回字符串
 * 如: http://example.com/path/?query=d#123 => 123
 *
 * @param {String} url url
 * @returns {String}
 */
export function getHash(url) {
  if (!url)
    return '';

  let pos = url.indexOf('#!');
  if (pos !== -1)
    pos++;
  else
    pos = url.indexOf('#');

  return pos !== -1 ? url.substring(pos + 1) : ''; // ??? '/'
}

export function hashParam(name) {
  let rc = null;

  const hash = getHash(location.hash);
  if (!hash)
    return '';

  const pos = hash.indexOf('?');
  if (pos === -1)
    return '';

  const val = `&${hash.substr(pos + 1)}&`;
  const rg = new RegExp(`&${name}=([^&]*)&`);
  const rgs = rg.exec(val);
  if (rgs) {
    rc = rgs[1];
    rc = decodeURIComponent(rc);
    rc = trim(rc);
  }

  return rc;
}

export function session(name, val) {
  if (val !== undefined)
    sessionStorage.setItem(name, val);
  else {
    return sessionStorage.getItem(name) || '';
  }
}

// import pathToRegexp from 'path-to-regexp';

/**
 * 获取一个链接相对于当前页面的绝对地址形式
 *
 * 假设当前页面是 http://a.com/b/c
 * 那么有以下情况:
 * d => http://a.com/b/d
 * /e => http://a.com/e
 * #1 => http://a.com/b/c#1
 * http://b.com/f => http://b.com/f
 *
 * @param {String} url url
 * @returns {String}
 */
export function getAbsUrl(url) {
  var link = document.createElement('a');
  link.setAttribute('href', url);
  const abs = link.href;
  link = null;
  return abs;
}

/**
 * 获取一个 url 的基本部分，即不包括 hash
 *
 * @param {String} url url
 * @returns {String}
 */
export function getBaseUrl(url) {
  const pos = url.indexOf('#');
  return pos === -1 ? url.slice(0) : url.slice(0, pos);
}
