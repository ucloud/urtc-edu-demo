// @ts-nocheck
/* eslint-disable */
import React from "react";
import { Loading, Tooltip, Button } from "@ucloud-fe/react-components";
import {
  WhiteWebSdk,
  RoomWhiteboard,
  DeviceType,
  RoomPhase,
} from "white-react-sdk";
import { withRouter } from "react-router-dom";
import StudentFooter from "../studentFooter/index";
import paramServer from "../../common/js/paramServer";
import { PPTProgressPhase } from "./tools/upload/UploadManager";
import UploadBtn from "./tools/upload/UploadBtn";
import WhiteboardBottomRight from "./tools/ppt/BottomRight";
import MenuAnnexBox from "./menu/AnnexBox";
import { imClient } from "../../common/serve/imServe.js";
import "@/src/assets/iconfont/iconfont.css";
import "./index.scss";
import { ossConfigObj } from "../../../config/writeConfig.json";

const MenuInnerType = {
  HotKey: "HotKey",
  AnnexBox: "AnnexBox",
  PPTBox: "PPTBox",
  DocSet: "DocSet",
};

class Write extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currActive: "",
      phase: RoomPhase.Connecting,
      menuInnerState: MenuInnerType.AnnexBox,
      isMenuVisible: true,
    };
    this.didLeavePage = false;

    //父级组件暴露元素，方便调用加入白板功能
    this.props.onRef(this);
  }

  componentWillMount() {
    window.addEventListener("resize", this.onWindowResize);
  }

  async componentDidMount() {
    await this.joinWhite();
    imClient.on("Users", (data) => {});
  }

  componentWillUnmount() {
    this.didLeavePage = true;
    this.leaveWhite();
    window.removeEventListener("resize", this.onWindowResize);
  }

  renderMenuInner = () => {
    switch (this.state.menuInnerState) {
      // case MenuInnerType.HotKey:
      //     return <MenuHotKey handleHotKeyMenuState={this.handleHotKeyMenuState}/>;
      case MenuInnerType.AnnexBox:
        if (!this.state.roomState || !this.state.roomState.sceneState)
          return null;
        return (
          <MenuAnnexBox
            isMenuOpen={this.state.isMenuVisible}
            room={this.state.room}
            roomState={this.state.roomState}
            handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
          />
        );
      // case MenuInnerType.PPTBox:
      //     return <MenuPPTDoc
      //         room={this.state.room!}/>;
      default:
        return null;
    }
  };

  renderWhiteboard() {
    if (this.state.room) {
      console.log("this.state.room", this.state.room);
      return (
        <RoomWhiteboard
          room={this.state.room}
          style={{ width: "100%", height: "100%" }}
        />
      );
    } else {
      return null;
    }
  }
  // getWhite(obj) {
  //     let param = paramServer.getParam();
  //     console.log(111)
  //     let _that = this;
  //     let role_type = 0;
  //     const sdkToken = param.Token;
  //     let url = 'https://cloudcapiv4.herewhite.com/room?token=' + sdkToken;
  //     const requestInit = {
  //         method: 'POST',
  //         headers: {
  //             "content-type": "application/json",
  //         },
  //         body: JSON.stringify({
  //             name: ' White room',
  //             limit: 100, // 房间人数限制
  //         }),
  //     };
  //     return new Promise(function (resolve, reject) {
  //         if (role_type === 0) {
  //                 fetch(url, requestInit).then(function (response) {
  //                     return response.json();
  //                 }).then(function (json) {
  //                     console.log(111)
  //                     console.log(json)
  //                     let whiteWebSdk = new WhiteWebSdk({
  //                         zoomMaxScale: 3,
  //                         zoomMinScale: 0.3,
  //                         urlInterrupter: url => url,
  //                     });
  //                     // _that.whiteid = json.msg.room.uuid;
  //                     return whiteWebSdk.joinRoom({
  //                         uuid: json.msg.room.uuid,
  //                         roomToken: json.msg.roomToken,
  //                     });
  //                 }).then(function (room) {
  //                     // Step3: 加入成功后想白板绑定到指定的 dom 中
  //                     // bind(room);
  //                     resolve('build white success');
  //                     const element = document.createElement('div');
  //                     element.setAttribute('id', 'whiteboard');
  //                     element.className = "white-board";
  //                     document.getElementById('whiteboard_wrapper').appendChild(element);

  //                     room.bindHtmlElement(element);
  //                     _that.roomWhite = room;
  //                 }).catch(function (err) {
  //                     reject(err);
  //                 });
  //         } else {
  //             resolve('not allow create white,you can join in it');
  //         }

  //     })
  // }
  setWhiteboardLayerDownRef = (whiteboardLayerDownRef) => {
    this.setState({ whiteboardLayerDownRef: whiteboardLayerDownRef });
  };

  onWindowResize = () => {
    if (this.state.room) {
      this.state.room.refreshViewSize();
    }
  };

  joinWhite = async () => {
    let param = paramServer.getParam();
    //增加限制，判断token，没有则不创建白板
    if (!param.Token) {
      return;
    }
    let whiteWebSdk = new WhiteWebSdk({
      deviceType: DeviceType.Desktop,
      preloadDynamicPPT: true,
    });
    let room;
    try {
      room = await whiteWebSdk.joinRoom(
        {
          uuid: param.Uuid,
          roomToken: param.Token,
        },
        {
          onPhaseChanged: (phase) => {
            if (!this.didLeavePage) {
              this.setState({ phase }, () => {
                const { phase } = this.state;
                if (RoomPhase.Disconnected === phase) {
                  alert("白板已断开连接");
                }
              });
            }
          },
          onRoomStateChanged: (modifyState) => {
            // if (modifyState.roomMembers) {
            //     this.cursor.setColorAndAppliance(modifyState.roomMembers);
            // }
            console.log("modifyState", modifyState);
            this.setState({
              roomState: { ...this.state.roomState, ...modifyState },
            });
          },
        }
      );
      this.setState({
        room,
      });
      console.log("join init write success >>> : ", room);
    } catch (err) {
      alert("白板加入房间失败");
      this.setState({
        phase: RoomPhase.Disconnected,
      });
      return;
    }
    if (param.businessType === "class") {
      if (param.role_type == 2) {
        room.setViewMode("broadcaster");
      } else {
        setTimeout(() => {
          room.setViewMode("follower");
          room.disableOperations = true;
          // room.disableCameraTransform = true;
        }, 200);
      }
    }

    const {
      width,
      height,
    } = this.state.whiteboardLayerDownRef.getBoundingClientRect();
    console.log("width, height,", width, height);

    room.moveCameraToContain({
      originX: -width / 2,
      originY: -height / 2,
      // originX: 0,
      // originY: -120,
      width: width,
      height: height,
      animationMode: "immediately",
    });
    const D_Width = 1600;
    const D_Height = 875;

    const scale1 = (width - 260) / D_Width;
    const scale2 = height / D_Height;
    console.log("scale1", scale1, scale2);
    console.log(width, height);
    if (scale1 < scale2) {
      if (window.screen.width < 720) {
        console.log(
          "init ",
          -1 / scale1,
          height / 1.4 / scale1,
          (width - 60) / D_Width
        );
        room.moveCamera({
          // centerX: -1 / scale1,
          // centerY: height / 1.4 / scale1,
          scale: (width - 60) / D_Width,
        });
      } else {
        room.moveCamera({
          centerX: -10 / scale1,
          centerY: height / 10 / scale1,
          scale: scale1,
        });
      }
    } else {
      room.moveCamera({
        centerX: -10 / scale2,
        centerY: height / 10 / scale2,
        scale: scale2,
      });
    }

    this.setState({
      uuid: param.Uuid,
      roomToken: param.Token,
      room,
      roomState: room.state,
    });
  };

  leaveWhite = () => {
    const { room } = this.state;
    room.disconnect().then(() => {
      console.log("Leave white room success");
    });
  };

  //画笔
  writeActive(e, v) {
    this.state.room.setMemberState({
      currentApplianceName: e,
    });
    this.setState({
      currActive: e,
    });
  }
  //选择
  viewActive(e) {
    const { roomState } = this.state;
    let scale = roomState.zoomScale;
    if (e === "enlarge") {
      scale = scale * 1.1;
    } else {
      scale = scale * 0.9;
    }
    this.state.room.moveCamera({ scale: scale });
    this.state.room.moveCamera({
      // 均为可选参数
      // 视角中心，x，y 坐标原点为初始页面的额重点，xy 正方向分别为右侧，下侧。
      centerX: 50, // 视角中心坐标的 x 坐标
      centerY: 50, // 视角中心坐标的 y 坐标
      scale: this.scale, // 放缩比例
      animationMode: "immediately", // 2.2.2 新增 API，continuous:连续动画（默认），immediately: 瞬间完成
    });
  }

  setMemberState = (modifyState) => {
    if (this.state.room) {
      this.state.room.setMemberState(modifyState);
    }
  };

  progress = (phase, percent) => {
    switch (phase) {
      case PPTProgressPhase.Uploading: {
        this.setState({ ossPercent: percent * 100 });
        break;
      }
      case PPTProgressPhase.Converting: {
        this.setState({ converterPercent: percent * 100 });
        break;
      }
      default:
        this.setState({ ossPercent: 0 });
        this.setState({ converterPercent: 0 });
    }
  };

  // handleHotKeyMenuState = () => {
  //     this.setState({
  //         isMenuVisible: !this.state.isMenuVisible,
  //         menuInnerState: MenuInnerType.HotKey,
  //         isMenuLeft: false,
  //     });
  // }
  handleAnnexBoxMenuState = () => {
    this.setState({
      isMenuVisible: !this.state.isMenuVisible,
      menuInnerState: MenuInnerType.AnnexBox,
      isMenuLeft: false,
    });
  };

  // handlePPtBoxMenuState = () => {
  //     if (this.state.isMenuVisible) {
  //         this.setState({
  //             isMenuVisible: !this.state.isMenuVisible,
  //         });
  //     } else {
  //         this.setState({
  //             isMenuVisible: !this.state.isMenuVisible,
  //             menuInnerState: MenuInnerType.PPTBox,
  //             isMenuLeft: true,
  //         });
  //     }
  // }
  judgeClass = () => {
    if (this.props.layout == undefined) {
      return true;
    } else if (this.props.layout == "big") {
      return true;
    } else {
      return false;
    }
  };

  renderPhase = () => {
    const { phase } = this.state;
    let pop;
    let content;
    switch (phase) {
      case RoomPhase.Connecting:
        pop = <div className="phase-tooltip">白板正在连接</div>;
        content = (
          <div className="phase">
            <div className="pill connecting"></div>
          </div>
        );
        break;
      case RoomPhase.Connected:
        pop = <div className="phase-tooltip">白板已连接</div>;
        content = (
          <div className="phase">
            <div className="pill connected"></div>
          </div>
        );
        break;
      case RoomPhase.Reconnecting:
        pop = <div className="phase-tooltip">白板正在重连</div>;
        content = (
          <div className="phase">
            <div className="pill reconnecting"></div>
          </div>
        );
        break;
      case RoomPhase.Disconnecting:
        pop = <div className="phase-tooltip">白板正在断开连接</div>;
        content = (
          <div className="phase">
            <div className="pill disconnecting"></div>
          </div>
        );
        break;
      case RoomPhase.Disconnected:
        pop = <div className="phase-tooltip">白板已断开连接</div>;
        content = (
          <div className="phase">
            <Button
              onClick={() => {
                this.joinWhite();
              }}
            >
              手动重连
            </Button>
          </div>
        );
        break;
      default:
    }
    return (
      <Tooltip placement="left" popup={pop}>
        {content}
      </Tooltip>
    );
  };

  render() {
    return (
      <div className={this.judgeClass() ? "write_main" : "write_main small"}>
        {this.renderPhase()}

        {/* <div style={{position:'absolute',top:0,left:0,zIndex:999}}>{this.state.roomState && this.state.roomState}</div>
         */}
        <div
          className={
            paramServer.getParam().role_type == 2
              ? "write_active clearfix"
              : "write_active clearfix hide"
          }
        >
          <span
            onClick={this.writeActive.bind(this, "selector")}
            className={`iconfont icon-mouse-pointer fl ${
              this.state.currActive === "selector" ? "active" : ""
            }`}
          ></span>
          <span
            onClick={this.writeActive.bind(this, "pencil")}
            className={`iconfont icon-edit fl ${
              this.state.currActive === "pencil" ? "active" : ""
            }`}
          ></span>
          <span
            onClick={this.writeActive.bind(this, "ellipse")}
            className={`iconfont icon-circle fl ${
              this.state.currActive === "ellipse" ? "active" : ""
            }`}
          ></span>
          <span
            onClick={this.writeActive.bind(this, "rectangle")}
            className={`iconfont icon-border fl ${
              this.state.currActive === "rectangle" ? "active" : ""
            }`}
          ></span>
          <span
            onClick={this.writeActive.bind(this, "text")}
            className={`iconfont icon-text fl ${
              this.state.currActive === "text" ? "active" : ""
            }`}
          ></span>
          <span
            onClick={this.writeActive.bind(this, "eraser")}
            className={`iconfont icon-eraser fl ${
              this.state.currActive === "eraser" ? "active" : ""
            }`}
          ></span>
          <span
            onClick={this.viewActive.bind(this, "enlarge")}
            className={`iconfont icon-zoomin fl ${
              this.state.currActive === "enlarge" ? "active" : ""
            }`}
          ></span>
          <span
            onClick={this.viewActive.bind(this, "reduce")}
            className={`iconfont icon-zoomout fl ${
              this.state.currActive === "reduce" ? "active" : ""
            }`}
          ></span>
          <UploadBtn
            oss={ossConfigObj}
            room={this.state.room}
            roomToken={this.state.roomToken}
            onProgress={this.progress}
            whiteboardRef={this.state.whiteboardLayerDownRef}
          />
        </div>
        <div
          id="whiteboard"
          className="white-board"
          ref={this.setWhiteboardLayerDownRef}
        >
          {this.renderWhiteboard()}
        </div>
        {paramServer.getParam().role_type == 2 && this.state.roomState ? (
          <WhiteboardBottomRight
            roomState={this.state.roomState}
            handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
            // handleHotKeyMenuState={this.handleHotKeyMenuState}
            room={this.state.room}
          />
        ) : null}
        {paramServer.getParam().role_type == 2 &&
        this.state.roomState &&
        this.state.isMenuVisible ? (
          <div className="menu-box">{this.renderMenuInner()}</div>
        ) : null}
      </div>
    );
  }
}

export default withRouter(Write);
