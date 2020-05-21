// @ts-nocheck
/* eslint-disable */
import React from "react";
import { Row, Col, Button, Icon } from "@ucloud-fe/react-components";
import { findDOMNode } from "react-dom";
import StudentFooter from "../../components/studentFooter";
import Write from "../../components/write/index";
import Chat from "../../components/chat/index";
import ReactPlayer from "react-player";
import SubscribeVideo from "../../components/subscribe/index";
import "./index.scss";
import paramServer from "../../common/js/paramServer";
import { Client, sdk, Logger } from "../../common/serve/rtcServe.js";

import { imClient } from "../../common/serve/imServe.js";
import screenfull from "screenfull";
import { isSupportWebRTC } from "../../common/serve/rtcServe";
import { setCookie, getCookie } from "../../common/js/cookie";

import {
  exitFullScreen,
  openFullscreen,
  IsPC,
  is_weixin,
  is_ios,
} from "../../common/util/index";

if (process.env.REACT_APP_ENV === "pre") {
  Logger.setLogLevel("debug");
}

const config = {
  role_type: 0, //用户权限0 推流 1 拉流 2 全部
  audiooutput: null, //扬声器id
  video: null, //视频设备id
  audiointput: null, //麦克风id
  resolving_power: null, //分辨率
};

class StudentClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      devicesList: [],
      token: null,
      roomId: null,
      params: null,
      monitorData: null,
      videoSrcObject: null,
      videoSrcObjectId: "",
      loadList: [],
      closeLeft: false,
      changeLayout: true,
      localStream: null,
      appData: {
        appId: paramServer.getParam().appId,
        userId: paramServer.getParam().userId,
        mediaType: paramServer.getParam().mediaType, //桌面和摄像头采集类型
        appkey: paramServer.getParam().appkey,
      },
      videoCurr: false,
      users: [],
      remoteStreams: [],
      onlineOnce: false,
      rtmpShow: false,
      is_ios: is_ios(),
      isSafari:
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent),
    };
    this.videoList = [];
    this.removeArrValue = this.removeArrValue.bind(this);
    this.online = this.online.bind(this);
    this.studentPlayer = React.createRef();
  }

  componentDidMount() {
    // 从缓存拿参数，退出清空
    let param = paramServer.getParam();
    imClient.on("CallReply", (data) => {
      let { replyuserid, operation } = data;
      let { params } = this.state;
      console.log("params.userId === replyuserid", params.userId, replyuserid);
      if (params.userId === replyuserid && operation === "agree") {
        this.online();
      }
    });
    let _this = this;
    this.setState(
      {
        params: param,
      },
      () => {
        let support = isSupportWebRTC();
        let role_type = 2; //默认老师
        if (getCookie("role_type")) {
          role_type = getCookie("role_type");
        }
        let is_ios_weixin = is_weixin() && is_ios();
        console.log("is_ios_weixin", is_weixin(), is_ios());
        //验证跳过ios微信
        if (is_ios_weixin || support) {
          this.urtcInit(this.state.params.role_type);
        } else {
          // 不支持rtc，弹出浮层提示
          console.log("this.props.target", this.props.target);
          if (role_type == 1) {
            this.setState({
              rtmpShow: true,
            });
          }
        }
      }
    );

    //监听房间连麦状态
    imClient.on("CallAuth", (data) => {
      if (
        this.state.onlineOnce &&
        data.operation == "close" &&
        paramServer.getParam().role_type == 1
      ) {
        //学生端同步下麦
        this.downMic();
      }
    });

    //自己手动下麦关闭摄像头
    imClient.on("CallApply", (data) => {
      console.log("被踢下麦CallApply", data);
      let flag = false;
      let arr = data ? data : [];
      let inRtcArr = window.p
        ? window.p.getUsers().map((e) => {
            return e.uid;
          })
        : [];
      arr.map((e) => {
        console.log(
          "下麦操作",
          e.UserId,
          paramServer.getParam().userId,
          inRtcArr.includes(e.UserId),
          inRtcArr
        );
        if (
          e.UserId === paramServer.getParam().userId ||
          inRtcArr.includes(e.UserId)
        ) {
          flag = true;
        }
      });
      console.log("下麦操作", flag);
      if (this.state.onlineOnce && !flag) {
        this.setState({
          onlineOnce: false,
        });
        this.downMic();
      }
    });
  }

  downMic = () => {
    this.setState({
      remoteStreams: [],
      localStream: null,
    });
    this.client.leaveRoom(() => {
      this.urtcInit(1);
    });
  };

  urtcInit = (role_type, callback) => {
    console.log("role_type join stram ", role_type);
    const appData = paramServer.getParam();
    const token = sdk.generateToken(
      appData.appId,
      appData.appkey,
      appData.roomId,
      appData.userId
    );
    const role =
      role_type === 0 ? "push" : role_type === 2 ? "push-and-pull" : "pull";
    console.log("role>>>", role, role_type);
    window.p = this.client = new Client(appData.appId, token, {
      type: appData.room_type === 0 ? "rtc" : "live",
      role: role,
    });
    console.log(this.client);
    this.client.on("stream-published", (stream) => {
      console.log("stream-published ", stream);
      this.setState({
        localStream: stream,
      });
    });

    this.client.on("stream-subscribed", (stream) => {
      console.log("stream-subscribed ", stream);

      //老师id数组
      // let teacherIdArr = paramServer.getParam().teachList.map(e => {
      //   return e.UserId;
      // });
      const { remoteStreams = [] } = this.state;
      remoteStreams.push(stream);
      this.updateRtcList(this.client.getRemoteStreams());
      this.setState({
        remoteStreams,
        videoList: this.client.getRemoteStreams(),
      });
    });

    this.client.on("user-added", (user) => {
      console.log("user-added ", user);
      const { users } = this.state;
      users.push(user);
      this.setState({ users });
    });

    this.client.on("user-removed", (user) => {
      console.log("user-removed ", user);
      const { users } = this.state;
      let idx = users.findIndex((item) => item.uid === user.uid);
      if (idx >= 0) {
        users.splice(idx, 1);
      }
      this.setState({ users });
    });

    this.client.on("stream-added", (stream) => {
      console.log("stream-added ", stream);

      this.client.subscribe(stream.sid, (e) => {
        this.setState({
          rtmpShow: true,
        });
        console.log("subscribe failure ", e);
      });
    });

    this.client.on("stream-removed", (stream) => {
      console.log("stream-removed ", stream);

      const { remoteStreams = [] } = this.state;
      const idx = remoteStreams.findIndex((item) => stream.sid === item.sid);
      if (idx !== -1) {
        remoteStreams.splice(idx, 1);
      }
      this.setState({ remoteStreams });
    });

    this.client.joinRoom(appData.roomId, appData.userId, (users, streams) => {
      // this.client.setVideoProfile('1280*720');
      console.log("current users and streams in room ", users, streams);

      if (role === "pull") return;
      this.client.publish(
        {
          audio: true,
          video: true,
          screen: false,
        },
        (e) => {
          console.log("publish failure ", e);
        }
      );
    });
    callback && callback();
  };

  online = () => {
    this.setState({
      remoteStreams: [],
      onlineOnce: true,
    });
    this.client.leaveRoom(() => {
      this.urtcInit(2);
    });
    // console.log(paramServer.getParam())
  };

  updateRtcList(arr) {
    let o = paramServer.getParam();
    paramServer.setParam(Object.assign(o, { rtcList: arr }));
    // console.error(paramServer.getParam())
  }

  removeArrValue(arr, attr, val) {
    let index = 0;
    for (let i in arr) {
      if (arr[i][attr] === val) {
        index = i;
        break;
      }
    }
    arr.splice(index, 1);
  }

  close = () => {
    let flag = this.state.closeLeft;
    this.setState({
      closeLeft: !flag,
    });
  };

  changeLayout = () => {
    let flag = this.state.changeLayout;
    this.setState({
      changeLayout: !flag,
    });
  };
  judgeClass = () => {
    if (this.state.changeLayout) {
      return true;
    } else if (this.state.changeLayout) {
      return false;
    }
  };

  //加入白板
  joinWrite = (ref) => {
    console.log(this.child);
    this.child.joinWhite();
  };
  //绑定子组件元素
  onRef = (ref) => {
    this.child = ref;
  };

  fullScreen = () => {
    console.log("full screen success", this.studentPlayer);

    openFullscreen(this.studentPlayer.current);
  };

  filterTeachStream = () => {
    const { remoteStreams, params } = this.state;
    // return remoteStreams
    if (!remoteStreams.length) {
      return [];
    }
    let teachList = imClient.getAdminUsers().map((e) => {
      return e.UserId;
    });
    let tempTeachArr = [];
    remoteStreams.map((e) => {
      if (teachList.includes(e.uid)) {
        tempTeachArr.push(e);
      }
    });
    return tempTeachArr;
  };

  createHlsUrl(params) {
    if (!params) {
      return "";
    }
    // let url = `http://hls.urtc.com.cn/play/hls/${params.appId + params.roomId}/index.m3u8`;
    let url = `http://120.132.22.49/play/hls/${
      params.appId + params.roomId
    }/index.m3u8`;
    console.log("createHlsUrl", url);
    return url;
  }

  playerError = (e) => {
    console.error("playerError", e);
  };

  getVideoDom = (flag) => {
    let { params, isSafari, is_ios } = this.state;
    if (params && flag) {
      console.log("live url ", this.createHlsUrl(params));

      return (
        <ReactPlayer
          key={this.filterTeachStream()[0] && this.filterTeachStream()[0].sid}
          onError={(error, data, hlsInstance, hlsGlobal) => {
            console.log(
              "player onError hls",
              error,
              data,
              hlsInstance,
              hlsGlobal
            );
          }}
          width={"100%"}
          className="viewport-play"
          height="100%"
          ref={this.studentPlayer}
          url={this.createHlsUrl(params)}
          // url={"http://rtchls.ugslb.com/rtclive/urtc.m3u8"}
          config={{
            file: {
              forceHLS: true,
              hlsVersion: "1.1.2",
            },
          }}
          playing={true}
          playsinline
        />
      );
    } else {
      return (
        <ReactPlayer
          key={this.filterTeachStream()[0] && this.filterTeachStream()[0].sid}
          onError={(error, data, hlsInstance, hlsGlobal) => {
            console.log(
              "player onError not hls",
              error,
              data,
              hlsInstance,
              hlsGlobal
            );
          }}
          width={"100%"}
          className="viewport-play notinline"
          height="100%"
          url={
            this.filterTeachStream()[0] &&
            this.filterTeachStream()[0].mediaStream
          }
          playing={true}
          controls={isSafari || is_ios ? true : false}
          autoplay
          playsinline
        />
      );
    }
  };

  render() {
    const {
      params,
      monitorData,
      closeLeft,
      changeLayout,
      tabsKey,
      localStream,
      remoteStreams = [],
      rtmpShow,
      isSafari,
    } = this.state;
    console.log("rtmpShow", rtmpShow, this.createHlsUrl(params));
    return (
      <div className="studentClass">
        <div>
          <div className="classroom_layout clearfix">
            <div>
              <div className="sub_wrapper">
                <SubscribeVideo
                  layout={
                    paramServer.getParam().role_type == 2 && changeLayout
                      ? "small"
                      : "big"
                  }
                  data={remoteStreams}
                  local={localStream && localStream}
                />
              </div>
            </div>

            {/* <Sidebar></Sidebar> */}
            <Row
              style={{
                height: "100%",
                width: "100%",
                padding: "0",
                backgroundColor: "##f0f4ff",
              }}
              className="viewport-flex"
              gutter={0}
              type="flex"
            >
              <Col className="viewport-left" span={closeLeft ? 0 : 2}>
                {/* <Localvideo></Localvideo> */}
                {changeLayout ? (
                  <div className="localvideo_main" ref={this.studentPlayer}>
                    {this.getVideoDom(rtmpShow)}
                    {IsPC() && !isSafari ? (
                      <div
                        style={{
                          cursor: "pointer",
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                        }}
                        onClick={this.fullScreen}
                      >
                        <b>
                          <Icon type="maximize" />{" "}
                        </b>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="localvideo_main">
                    <Write
                      changeLayout={changeLayout}
                      onRef={this.onRef}
                      layout={
                        paramServer.getParam().role_type == 2 && changeLayout
                          ? "big"
                          : "small"
                      }
                      appData={this.state.appData}
                      changeLayout={() => {
                        this.changeLayout();
                      }}
                    ></Write>
                  </div>
                )}
                <Chat
                  loadList={this.state.loadList}
                  changeDataList={() => this.online()}
                  params={params}
                  closeLeft={closeLeft}
                  close={() => this.close()}
                  joinWrite={this.joinWrite}
                  urtcInit={() => this.downMic()}
                  appData={this.state.appData}
                />
              </Col>

              <Col
                className="viewport-right classroom_left"
                span={closeLeft ? 12 : 10}
              >
                {changeLayout ? (
                  <Write
                    onRef={this.onRef}
                    appData={this.state.appData}
                    layout={
                      paramServer.getParam().role_type == 2 && !changeLayout
                        ? "small"
                        : "big"
                    }
                    changeLayout={() => {
                      this.changeLayout();
                    }}
                  />
                ) : (
                  <div className="">
                    <ReactPlayer
                      vimeoConfig={{ iframeParams: { fullscreen: 0 } }}
                      key={remoteStreams[0] && remoteStreams[0].sid}
                      width={"100%"}
                      height="100%"
                      url={remoteStreams[0] && remoteStreams[0].mediaStream}
                      playing
                      playsinline
                    />
                  </div>
                )}
              </Col>
            </Row>
          </div>
        </div>

        {closeLeft ? (
          <div className="openLeft" onClick={this.close}>
            <Icon type="arrow-right"></Icon>
          </div>
        ) : null}

        <StudentFooter
          changeLayout={() => this.changeLayout()}
          downMic={this.downMic}
        ></StudentFooter>
      </div>
    );
  }
}

export default StudentClass;
