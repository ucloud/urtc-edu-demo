// @ts-nocheck
/* eslint-disable */

import React from "react";
import publishedSDK from "urtc-sdk";
import Nav from "../../components/nav/index";
import Footer from "../../components/footer/index";
import Chat from "../../components/chat/index";
import ReactPlayer from "react-player";
import { rtcConfig } from "../../../config/rtcConfig";
import "./index.scss";
import paramServer from "../../common/js/paramServer";

let sdk = publishedSDK;
if (process.env.REACT_APP_ENV === "pre") {
  sdk.setServers({
    api: "https://pre.urtc.com.cn",
    // log: "https://logpre.urtc.com.cn"
    // signal: "wss://urtc.ibusre.cn:5005"
  });
}

const { Client, Logger } = sdk;

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

class LiveClass extends React.Component {
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
      tabsKey: 0,
      recording: false,
      appData: {
        appId: paramServer.getParam().appId,
        userId: paramServer.getParam().userId,
        mediaType: paramServer.getParam().mediaType, //桌面和摄像头采集类型
        appkey: paramServer.getParam().appkey,
      },
      videoCurr: false,
      localStream: null,
      users: [],
    };
    this.videoList = [];
    this.removeArrValue = this.removeArrValue.bind(this);
    this.online = this.online.bind(this);
  }

  componentDidMount() {
    // 从缓存拿参数，退出清空
    let param = paramServer.getParam();

    this.setState(
      {
        params: param,
      },
      () => {
        this.urtcInit(this.state.params.role_type);
        // this.urtcInit();
      }
    );
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

  urtcInit = (role_type) => {
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

    this.client.on("stream-published", (stream) => {
      console.log("stream-published ", stream);
      this.setState(
        {
          localStream: stream,
        },
        () => {
          this.recording();
        }
      );
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
  };

  /**
   * @description 学生上麦操作，推出房间，更改房间类型并重新加入
   */
  online = () => {
    this.setState({
      remoteStreams: [],
    });
    this.client.leaveRoom(() => {
      this.urtcInit(2);
    });
    // console.log(paramServer.getParam())
  };

  recording = () => {
    if (this.state.recording === false) {
      let params = {
        bucket: rtcConfig.bucket,
        region: rtcConfig.region,
        relay: {
          fragment: 60,
        },
      };
      this.client.startRecording(params, (record) => {
        console.log("start recording success ", record);
        const url = `http://${params.bucket}.${params.region}.ufileos.com/${record.FileName}`;
        console.log("record url", url);
      });
      this.setState({
        recording: true,
      });
    }
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

  //加入白板
  joinWrite = (ref) => {};
  onRef = (ref) => {
    this.child = ref;
  };
  render() {
    const {
      params,
      monitorData,
      tabsKey,
      localStream,
      remoteStreams = [],
    } = this.state;

    console.log("remoteStreams", remoteStreams, localStream);
    return (
      <div className=" live_class ">
        <div className="classroom_main">
          <div>
            <Nav monitorData={monitorData}></Nav>
            <div className="classroom_layout clearfix">
              {/* <Sidebar></Sidebar> */}
              <div
                className="room-layout"
                style={{
                  height: "100%",
                  width: "100%",
                  padding: "0",
                  backgroundColor: "##f0f4ff",
                }}
              >
                {/* <div className="room-left">
                <div className="localvideo_main">
                  <ReactPlayer
                    key={localStream && localStream.sid}
                    width="256px"
                    height="192px"
                    url={localStream && localStream.mediaStream}
                    muted
                    playing
                    playsinline
                  />
                </div>
              </div> */}

                <div className="room-center">
                  {params && params.role_type == 2 ? (
                    <ReactPlayer
                      key={localStream && localStream.sid}
                      width="100%"
                      height="100%"
                      url={localStream && localStream.mediaStream}
                      muted={true}
                      playing
                      playsinline
                    />
                  ) : (
                    <ReactPlayer
                      key={remoteStreams[0] && remoteStreams[0].sid}
                      width="100%"
                      height="100%"
                      url={remoteStreams[0] && remoteStreams[0].mediaStream}
                      muted={false}
                      playing
                      playsinline
                    />
                  )}
                </div>

                <div className="room-right">
                  <Chat
                    loadList={this.state.loadList}
                    changeDataList={() => this.online()}
                    params={params}
                    joinWrite={this.joinWrite}
                    urtcInit={() => this.downMic()}
                    appData={this.state.appData}
                  />
                </div>
              </div>
            </div>
            <Footer monitorData={monitorData} rtcList={this.state.loadList} />
          </div>
        </div>
      </div>
    );
  }
}

export default LiveClass;
