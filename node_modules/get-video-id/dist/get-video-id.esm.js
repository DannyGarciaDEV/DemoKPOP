/*! get-video-id v3.6.5 | @license MIT © Michael Wuergler | https://github.com/radiovisual/get-video-id */
/**
 * Strip away any remaining parameters following `?` or `/` or '&' for YouTube shortcode strings.
 *
 * @note this function is not meant to work with url strings containing a protocol like https://
 * @param {String} shortcodeString - the parameter string
 * @returns {String}
 */
function stripParameters(shortcodeString) {
  // Split parameters or split folder separator
  if (shortcodeString.includes('?')) {
    shortcodeString = shortcodeString.split('?')[0];
  }

  if (shortcodeString.includes('/')) {
    shortcodeString = shortcodeString.split('/')[0];
  }

  if (shortcodeString.includes('&')) {
    shortcodeString = shortcodeString.split('&')[0];
  }

  return shortcodeString;
}
/**
 * Get the Youtube Video id.
 * @param {string} youtubeStr - the url from which you want to extract the id
 * @returns {string|undefined}
 */


function youtube(youtubeString) {
  var string_ = youtubeString; // Remove time hash at the end of the string

  string_ = string_.replace(/#t=.*$/, ''); // Strip the leading protocol

  string_ = string_.replace(/^https?:\/\//, ''); // Shortcode

  var shortcode = /youtube:\/\/|youtu\.be\/|y2u\.be\//g;

  if (shortcode.test(string_)) {
    var shortcodeid = string_.split(shortcode)[1];
    return stripParameters(shortcodeid);
  } // Shorts


  var shortsUrl = /\/shorts\//g;

  if (shortsUrl.test(string_)) {
    return stripParameters(string_.split(shortsUrl)[1]);
  } // V= or vi=


  var parameterv = /v=|vi=/g;

  if (parameterv.test(string_)) {
    var array = string_.split(parameterv);
    return stripParameters(array[1].split('&')[0]);
  } // /v/ or /vi/ or /watch/


  var inlinev = /\/v\/|\/vi\/|\/watch\//g;

  if (inlinev.test(string_)) {
    var inlineid = string_.split(inlinev)[1];
    return stripParameters(inlineid);
  } // Format an_webp


  var parameterwebp = /\/an_webp\//g;

  if (parameterwebp.test(string_)) {
    var webp = string_.split(parameterwebp)[1];
    return stripParameters(webp);
  } // /e/


  var eformat = /\/e\//g;

  if (eformat.test(string_)) {
    var estring = string_.split(eformat)[1];
    return stripParameters(estring);
  } // Embed


  var embedreg = /\/embed\//g;

  if (embedreg.test(string_)) {
    var embedid = string_.split(embedreg)[1];
    return stripParameters(embedid);
  } // ignore /user/username pattern


  var usernamereg = /\/user\/([a-zA-Z\d]*)$/g;

  if (usernamereg.test(string_)) {
    return undefined;
  } // User


  var userreg = /\/user\/(?!.*videos)/g;

  if (userreg.test(string_)) {
    var elements = string_.split('/');
    return stripParameters(elements.pop());
  } // Attribution_link


  var attrreg = /\/attribution_link\?.*v%3D([^%&]*)(%26|&|$)/;

  if (attrreg.test(string_)) {
    return stripParameters(string_.match(attrreg)[1]);
  }

  return undefined;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 * Get the vimeo id.
 *
 * @param {String} vimeoString the url from which you want to extract the id
 * @returns {String|undefined}
 */
function vimeo(vimeoString) {
  var string_ = vimeoString;

  if (string_.includes('#')) {
    var _string_$split = string_.split('#');

    var _string_$split2 = _slicedToArray(_string_$split, 1);

    string_ = _string_$split2[0];
  }

  if (string_.includes('?') && !string_.includes('clip_id=')) {
    var _string_$split3 = string_.split('?');

    var _string_$split4 = _slicedToArray(_string_$split3, 1);

    string_ = _string_$split4[0];
  }

  var id;
  var array;
  var event = /https?:\/\/vimeo\.com\/event\/(\d+)$/;
  var eventMatches = event.exec(string_);

  if (eventMatches && eventMatches[1]) {
    return eventMatches[1];
  }

  var primary = /https?:\/\/vimeo\.com\/(\d+)/;
  var matches = primary.exec(string_);

  if (matches && matches[1]) {
    return matches[1];
  }

  var vimeoPipe = ['https?://player.vimeo.com/video/[0-9]+$', 'https?://vimeo.com/channels', 'groups', 'album'].join('|');
  var vimeoRegex = new RegExp(vimeoPipe, 'gim');

  if (vimeoRegex.test(string_)) {
    array = string_.split('/');

    if (array && array.length > 0) {
      id = array.pop();
    }
  } else if (/clip_id=/gim.test(string_)) {
    array = string_.split('clip_id=');

    if (array && array.length > 0) {
      var _array$1$split = array[1].split('&');

      var _array$1$split2 = _slicedToArray(_array$1$split, 1);

      id = _array$1$split2[0];
    }
  }

  return id;
}

/**
 * Get the vine id.
 * @param {string} string_ - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function vine(string_) {
  var regex = /https:\/\/vine\.co\/v\/([a-zA-Z\d]*)\/?/;
  var matches = regex.exec(string_);

  if (matches && matches.length > 1) {
    return matches[1];
  }

  return undefined;
}

/**
 * Get the VideoPress id.
 * @param {string} urlString - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function videopress(urlString) {
  var idRegex;

  if (urlString.includes('embed')) {
    idRegex = /embed\/(\w{8})/;
    return urlString.match(idRegex)[1];
  }

  idRegex = /\/v\/(\w{8})/;
  var matches = urlString.match(idRegex);

  if (matches && matches.length > 0) {
    return matches[1];
  }

  return undefined;
}

/**
 * Get the Microsoft Stream id.
 * @param {string} urlString - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function microsoftStream(urlString) {
  var regex = urlString.includes('embed') ? /https:\/\/web\.microsoftstream\.com\/embed\/video\/([a-zA-Z\d-]*)\/?/ : /https:\/\/web\.microsoftstream\.com\/video\/([a-zA-Z\d-]*)\/?/;
  var matches = regex.exec(urlString);

  if (matches && matches.length > 1) {
    return matches[1];
  }

  return undefined;
}

/**
 * Get the tiktok id.
 * @param {string} urlString - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function tiktok(urlString) {
  // Parse basic url and embeds
  var basicReg = /tiktok\.com(.*)\/video\/(\d+)/gm;
  var basicParsed = basicReg.exec(urlString);

  if (basicParsed && basicParsed.length > 2) {
    return basicParsed[2];
  }

  return undefined;
}

/**
 * Get the dailymotion id.
 * @param {string} urlString - the url from which you want to extract the id
 * @returns {string|undefined}
 */
function dailymotion(urlString) {
  // Parse basic url and embeds
  var basicReg = /dailymotion\.com(.*)(video)\/([a-zA-Z\d]+)/gm;
  var basicParsed = basicReg.exec(urlString);

  if (basicParsed) {
    return basicParsed[3];
  } // Parse shortlink


  var shortRegex = /dai\.ly\/([a-zA-Z\d]+)/gm;
  var shortParsed = shortRegex.exec(urlString);

  if (shortParsed && shortParsed.length > 1) {
    return shortParsed[1];
  } // Dynamic link


  var dynamicRegex = /dailymotion\.com(.*)video=([a-zA-Z\d]+)/gm;
  var dynamicParsed = dynamicRegex.exec(urlString);

  if (dynamicParsed && dynamicParsed.length > 2) {
    return dynamicParsed[2];
  }

  return undefined;
}

/**
 * Get the value assigned to a "src" attribute in a string, or undefined.
 * @param {String} input
 * @returns {String|undefined}
 */
function getSrc(input) {
  if (typeof input !== 'string') {
    throw new TypeError('getSrc expected a string');
  }

  var srcRegEx = /src="(.*?)"/gm;
  var matches = srcRegEx.exec(input);

  if (matches && matches.length >= 2) {
    return matches[1];
  }

  return undefined;
}

/**
 * Get the id and service from a video url.
 * @param {String} urlString - the url from which you want to extract the id
 * @returns {Object}
 */

function getVideoId(urlString) {
  if (typeof urlString !== 'string') {
    throw new TypeError('get-video-id expects a string');
  }

  var string_ = urlString;

  if (/<iframe/gi.test(string_)) {
    string_ = getSrc(string_) || '';
  } // Remove surrounding whitespaces or linefeeds


  string_ = string_.trim(); // Remove the '-nocookie' flag from youtube urls

  string_ = string_.replace('-nocookie', ''); // Remove any leading `www.`

  string_ = string_.replace('/www.', '/');
  var metadata = {
    id: null,
    service: null
  }; // Try to handle google redirection uri

  if (/\/\/google/.test(string_)) {
    // Find the redirection uri
    var matches = string_.match(/url=([^&]+)&/); // Decode the found uri and replace current url string - continue with final link

    if (matches) {
      // JavaScript can get encoded URI
      string_ = decodeURIComponent(matches[1]);
    }
  }

  if (/youtube|youtu\.be|y2u\.be|i.ytimg\./.test(string_)) {
    metadata = {
      id: youtube(string_),
      service: 'youtube'
    };
  } else if (/vimeo/.test(string_)) {
    metadata = {
      id: vimeo(string_),
      service: 'vimeo'
    };
  } else if (/vine/.test(string_)) {
    metadata = {
      id: vine(string_),
      service: 'vine'
    };
  } else if (/videopress/.test(string_)) {
    metadata = {
      id: videopress(string_),
      service: 'videopress'
    };
  } else if (/microsoftstream/.test(string_)) {
    metadata = {
      id: microsoftStream(string_),
      service: 'microsoftstream'
    };
  } else if (/tiktok\.com/.test(string_)) {
    metadata = {
      id: tiktok(string_),
      service: 'tiktok'
    };
  } else if (/(dailymotion\.com|dai\.ly)/.test(string_)) {
    metadata = {
      id: dailymotion(string_),
      service: 'dailymotion'
    };
  }

  return metadata;
}

export default getVideoId;
//# sourceMappingURL=get-video-id.esm.js.map
