// @ts-nocheck
import publishedSDK from "urtc-sdk";
import { getLocalDict } from "../local/index";
let sdk = publishedSDK;
if (process.env.REACT_APP_ENV === "pre") {
  sdk.setServers({
    // api: "",
    // log: ""
    // signal: ""
  });
}

const {
  Client,
  Logger,
  deviceDetection,
  isSupportWebRTC,
  getSupportProfileNames,
} = sdk;
if (process.env.REACT_APP_ENV === "pre") {
  Logger.setLogLevel("debug");
}

deviceDetection(
  {
    audio: true, // 必填，指定是否检测麦克风设备
    video: true,
  },
  (result) => {
    console.log("deviceDetection>>>", result);
    if (result.audio && result.video) {
      // 麦克风和摄像头都可有和，发布或预览时可启用麦克风和摄像头
      // client.publish({audio: true, video: true});
    } else if (result.audio) {
      // 麦克风可用，发布或预览时能启用麦克风
      if (result.videoError === "Permission denied") {
        alert(getLocalDict(result.videoError));
      }
    } else if (result.video) {
      if (result.audioError === "Permission denied") {
        alert(getLocalDict(result.audioError));
      }
      // 摄像头可用，发布或预览时能启用摄像头
      // client.publish({audio: false, video: true});
    } else {
      if (result.videoError) {
        alert(getLocalDict(result.videoError));
      } else if (result.audioError) {
        alert(getLocalDict(result.audioError));
      }
      // 麦克风和摄像头都不可用
    }
  }
);

export {
  Client,
  sdk,
  deviceDetection,
  isSupportWebRTC,
  getSupportProfileNames,
  Logger,
};
