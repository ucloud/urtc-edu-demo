/* eslint-disable */
/*
 * @Description: 通用方法函数
 * @Author: leif
 * @Date: 2019-08-20 10:31:20
 * @LastEditTime: 2019-09-19 16:33:59
 * @LastEditors: Please set LastEditors
 */

// if (window.sumNum) {

// } else {
//     window.sumNum = 1
//     $('body').append(`<div class="logInfo hide"><div id="logInfo"><div></div>`);
// }
import _ from "lodash";

const log = function(e) {
  // console.log(e);
  // $('#logInfo').append(`
  // <p class="log_item">
  //     ${JSON.stringify(e)}
  // </p>`)
};
const error = function() {};

/**
 * randNum
 * @param {number} l
 * @returns
 */

function randNum(l) {
  let S = "0123456789abcdefghijklmnopqrstuvwxyz";
  let s = "";
  for (let n = 0; n < l; ++n) {
    s = s + S.charAt(Math.floor((Math.random() * 360) % 36));
  }
  return s;
}

const clone = obj => {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null === obj || "object" !== typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
};

function isHasUndefined(obj) {
  for (let name in obj) {
    if (typeof obj[name] == "object") {
      isHasUndefined(obj[name])();
    } else {
      return _.isUndefined(obj[name]);
    }
  }
}

//打开全屏方法
function openFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.msRequestFullscreen){
    element.msRequestFullscreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullScreen();
  }
}

function is_weixin() {
  var ua = window.navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    return true;
  } else {
    return false;
  }
}

function is_ios() {
  var u = navigator.userAgent;
  var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  if (isIOS) {
    return true;
  } else {
    return false;
  }
}

//退出全屏方法
function exitFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExiFullscreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

//判断是否为pc打开
function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "iPad",
    "iPod"
  ];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}


export {
  randNum,
  log,
  error,
  clone,
  isHasUndefined,
  openFullscreen,
  exitFullScreen,
  IsPC,
  is_weixin,
  is_ios,
};
