// @ts-nocheck
import React from "react";
import { Icon } from "@ucloud-fe/react-components";
import Nav from "../../components/nav/index";
import Footer from "../../components/footer/index";
import Write from "../../components/write/index";
import Chat from "../../components/chat/index";
import ReactPlayer from "react-player";
import SubscribeVideo from "../../components/subscribe/index";
import "./index.scss";
import paramServer from "../../common/js/paramServer";
import { Client, sdk } from "../../common/serve/rtcServe.js";
import { findDOMNode } from "react-dom";
import { openFullscreen, IsPC } from "../../common/util/index";

// const config = {
//   role_type: 0, //用户权限0 推流 1 拉流 2 全部
//   audiooutput: null, //扬声器id
//   video: null, //视频设备id
//   audiointput: null, //麦克风id
//   resolving_power: null //分辨率
// };

class ClassRoom extends React.Component {
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
    const { params } = this.state;
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
      setTimeout(() => {
        let _url = params.appId + params.roomId;
        this.client.startMix(
          {
            type: "relay",
            pushURL: [`rtmp://120.132.22.49/live/${_url}`],
          },
          (Err, Result) => {
            if (!Err) {
              console.log(
                "转推成功》》》",
                `rtmp://120.132.22.49/live/${_url}`
              );
            } else {
              console.log("转推失败》》》", _url, Err);
            }
          }
        );
      }, 6000);

      this.setState(
        {
          localStream: stream,
        },
        () => {
          // this.recording();
        }
      );
    });

    this.client.on("stream-subscribed", (stream) => {
      console.log("stream-subscribed ", stream);
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
    // if (this.state.recording === false) {
    //   const bucket = "urtc-test";
    //   const region = "cn-bj";
    //   let params = {
    //     bucket: bucket,
    //     region: region,
    //     relay: {
    //       fragment: 60
    //     }
    //   }
    //   this.client.startRecording(params,
    //     record => {
    //       console.log("start recording success ", record);
    //       const url = `http://${bucket}.${region}.ufileos.com/${record.FileName}`;
    //       console.log('record url', url);
    //     }
    //   );
    //   this.setState({
    //     recording: true
    //   });
    // }
  };

  updateRtcList(arr) {
    let o = paramServer.getParam();
    paramServer.setParam(Object.assign(o, { rtcList: arr }));
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
  joinWrite = (ref) => {
    // this.child.joinWhite()
  };
  onRef = (ref) => {
    this.child = ref;
  };

  ref = (player) => {
    this.teachPlayer = player;
  };

  fullScreen = () => {
    console.log("full screen success", findDOMNode(this.teachPlayer));
    openFullscreen(findDOMNode(this.teachPlayer));
  };

  render() {
    const { params, monitorData, localStream, remoteStreams = [] } = this.state;

    return (
      <div className="classroom_main">
        <div>
          <Nav monitorData={monitorData} refushWrite={this.joinWrite}></Nav>
          <div className="classroom_layout clearfix">
            <div
              className="room-layout"
              style={{
                height: "100%",
                width: "100%",
                padding: "0",
                backgroundColor: "##f0f4ff",
              }}
            >
              <div className="room-left">
                {/* <Localvideo></Localvideo> */}
                <div className="localvideo_main">
                  {/* <SubscribeVideo data={this.state.videoSrcObject}  /> this.state.videoSrcObject&&this.state.videoSrcObject.id */}
                  <ReactPlayer
                    key={localStream && localStream.sid}
                    width="256px"
                    height="192px"
                    ref={this.ref}
                    url={localStream && localStream.mediaStream}
                    muted
                    playing
                    playsinline
                  />
                  {IsPC() ? (
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
              </div>

              <div className="room-center">
                <SubscribeVideo
                  isTeacther={
                    params &&
                    (params.room_type === 0 ||
                      params.room_type ===
                        1) /* && params.role_type === 2 移动端未判断用户角色，为三端统一，暂时注释掉*/
                  }
                  localStream={localStream}
                  streams={remoteStreams || []}
                  data={remoteStreams}
                />

                <Write
                  onRef={this.onRef}
                  appData={this.state.appData}
                  join={this.joinWrite()}
                ></Write>
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
    );
  }
}

export default ClassRoom;
