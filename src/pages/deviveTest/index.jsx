// @ts-nocheck
/* eslint-disable */
import React from "react";
import "./index.scss";
import { Notice } from "@ucloud-fe/react-components";
import { deviceDetection, isSupportWebRTC } from "../../common/serve/rtcServe";
import { setCookie, getCookie } from "../../common/js/cookie";
import {
  is_weixin,
  is_ios,
  IsPC,
} from "../../common/util/index";

export default class DeviceTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rtcSupportShow: false,
      deviceShow: false,
      errorMsg:
        '您的浏览器不支持WebRTC音视频服务，请更换使用Chrome、Firefox、Safari',
      deviceErrorInfo: "",
      ios_weixin_text:'请在Safari里打开',
      is_ios_weixin: false,
    };
  }

  componentDidMount() {
    let support = isSupportWebRTC();
    console.log('support',support)
    let role_type = 2 //默认老师
    if (getCookie("role_type")) {
        role_type =  getCookie("role_type")
    }
    let is_ios_weixin = is_weixin() && is_ios()
    console.log('is_ios_weixin',is_weixin(),is_ios())
    //验证跳过mac微信 或者 edge 
    if( (IsPC() && is_weixin()) || (navigator.userAgent.indexOf("Edge") > -1)){
      // this.setState({
      //   rtcSupportShow: true
      // });
      return
    }
    if (is_ios_weixin || support) {
      //支持rtc，进行设备检测
      console.log('this.props.target',is_ios_weixin)
      // this.setState({
      //   // is_ios_weixin: true,
      // });
      if(this.props.target === 'login' && role_type == 2){
        // this.testDevce();
      }
    } else {
      // 不支持rtc，弹出浮层提示
      this.setState({
        // rtcSupportShow: true,
        is_ios_weixin: false,
      });
    }
  }

  testDevce = e => {
    deviceDetection(
      {
        audio: true, // 必填，指定是否检测麦克风设备
        video: true
      },
      Result => {
        let msg = "麦克风和摄像头不可用，请检查使用权限";
        if (Result.audio && Result.video) {
          // 麦克风和摄像头都可有和，发布或预览时可启用麦克风和摄像头
        } else if (Result.audio) {
          // 麦克风可用，发布或预览时能启用麦克风
          msg = "摄像头不可用，请检查使用权限";
          this.setState({
            deviceShow: true,
            deviceErrorInfo: msg,
          });
        } else if (Result.video) {
          // 摄像头可用，发布或预览时能启用摄像头
          msg = "麦克风不可用，请检查使用权限";
          this.setState({
            deviceShow: true,
            deviceErrorInfo: msg,
          });
        } else {
          // 麦克风和摄像头都不可用
          this.setState({
            deviceShow: true,
            deviceErrorInfo: msg,
          });
        }
      }
    );
  };

  jumpLive = () => {
    window.location = "http://rtchls.ugslb.com/rtclive/urtc.m3u8"
  }

  render() {
    const {
      errorMsg,
      rtcSupportShow,
      deviceShow,
      deviceErrorInfo
    } = this.state;
    return (
      <div className="device_test">
        {rtcSupportShow ? (
          <div className="device_mask_wrapper">
            <div className="device_mask">
              <Notice
                styleType={"error"}
                onClose={e => {
                  console.log("closed");
                }}
              >
                {errorMsg} 
                {/* <span className="live_watch" onClick={this.jumpLive}>  观看直播</span> */}
              </Notice>
            </div>
          </div>
        ) : null}
        {deviceShow ? (
          <div className="device_mask_wrapper">
            <div className="device_mask">
              <Notice
                styleType={"error"}
                onClose={e => {
                  console.log("closed");
                }}
              >
                {deviceErrorInfo}
              </Notice>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
