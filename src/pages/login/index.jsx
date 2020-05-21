// @ts-nocheck
/* eslint-disable */
import React from "react";
import "./index.scss";
import { Loading, Tabs, Message } from "@ucloud-fe/react-components";
import { randNum } from "../../common/util/index";
import axios from "axios";
import paramServer from "../../common/js/paramServer";
import { createClient, imClient } from "../../common/serve/imServe.js";
import Querystringify from "querystringify";
import ClassRoom from "./component/classroom";
import Live from "./component/live";
import { setCookie, getCookie } from "../../common/js/cookie";
import DeviceTest from "../deviveTest/index";
import { rtcConfig } from "../../../config/rtcConfig.json";
const { StyleType } = Tabs;
const verticalLayout = {};

let appData = {};
// paramServer.setParam( appData);

class Login extends React.Component {
  constructor(props) {
    super(props);
    const query = Querystringify.parse(props.location.search);
    const { type = "class", roomId = "" } = query;
    this.state = {
      businessType: type,
      loading: false,
      size: "md",
      disabled: false,
      role_type: "1",
      roomId: roomId,
      name: "",
      room_type: 1,
    };
  }

  componentDidMount() {
    console.log(getCookie("userId"));
    if (getCookie("businessType")) {
      this.setState({
        businessType: getCookie("businessType"),
      });
    }
    if (getCookie("name")) {
      this.setState({
        name: getCookie("name"),
      });
    }
    if (getCookie("roomId")) {
      this.setState({
        roomId: getCookie("roomId"),
      });
    }
    if (getCookie("roomId")) {
      this.setState({
        roomId: getCookie("roomId"),
      });
    }
    if (getCookie("role_type")) {
      this.setState({
        role_type: getCookie("role_type"),
      });
    }
  }

  changeRoleType = (roleType) => {
    this.setState({ role_type: roleType });
  };

  changeRoomId = (roomId) => {
    this.setState({ roomId });
  };

  changeName = (name) => {
    this.setState({ name });
  };

  joinRoom = () => {
    appData = {
      appId: rtcConfig.appId,
      userId: getCookie("userId") ? getCookie("userId") : randNum(8),
      // userId: '333',
      mediaType: "1", //桌面和摄像头采集类型
      appkey: rtcConfig.appkey,
    };

    createClient(appData.appId);
    const { role_type, roomId, name, room_type, businessType } = this.state;
    this.setState({
      loading: true,
    });
    let param = {
      room_type: room_type - 0,
      role_type: room_type == 0 ? 2 : role_type - 0,
      roomId,
      name,
      businessType,
      ...appData,
    };
    setCookie("appId", appData.appId, 60 * 24 * 60);
    // setCookie("userId", appData.userId, 60 * 24 * 60);
    setCookie("role_type", role_type, 60 * 24 * 60);
    setCookie("appkey", appData.appkey, 60 * 24 * 60);
    setCookie("room_type", room_type, 60 * 24 * 60);
    setCookie("businessType", businessType, 60 * 24 * 60);
    setCookie("roomId", roomId, 60 * 24 * 60);
    setCookie("name", name, 60 * 24 * 60);

    this.joinIM(param);
  };

  //加入im房间
  joinIM(param) {
    let type = "admin";
    if (param.room_type == 1) {
      //大班课
      type = param.role_type == 2 ? "admin" : "default";
    }
    try {
      imClient.joinRoom(
        param.roomId,
        param.userId,
        type,
        param.name,
        (data) => {
          console.log("CallTeamList", data);
          imClient.createWhite((whiteData) => {
            console.log("whiteData", whiteData);
            let { uuid, token } = whiteData;
            paramServer.setParam(
              Object.assign(
                {
                  defaultList: data.defaultUsers,
                  adminList: data.adminUsers,
                  roomInfo: data.roomInfo,
                  Token: token,
                  Uuid: uuid,
                },
                param
              )
            );
            this.setState({
              loading: false,
            });
            const { businessType } = this.state;
            if (type == "admin") {
              if (businessType === "class") {
                this.props.history.push({ pathname: `/class` });
              } else {
                this.props.history.push({ pathname: `/liveroom` });
              }
            } else {
              if (businessType === "class") {
                this.props.history.push({ pathname: `/student` });
              } else {
                this.props.history.push({ pathname: `/live` });
              }
            }
          });
        },
        (error) => {
          Message.error("当前房间可能没有老师，请等老师加入后重试");
          this.setState({
            loading: false,
          });
        }
      );
    } catch (err) {
      this.props.history.push({ pathname: `/student` });
    }
  }

  changeBusinessType = (type) => {
    this.setState({
      businessType: type,
    });
  };
  goUcloud = () => {
    window.open("www.ucloud.cn");
  };

  render() {
    const {
      businessType,
      size,
      role_type,
      roomId,
      name,
      loading,
      room_type,
    } = this.state;
    return (
      <div className="login_main">
        <div className="content clearfix">
          <Loading
            loading={loading}
            tip={"joining..."}
            style={{ height: "100%", width: "100%" }}
          >
            <a
              href="https://www.ucloud.cn/"
              target="_blank"
              onClick={this.goUcloud}
            >
              <p className="bg_img_content"></p>
            </a>
            <div className="form_wrapper">
              <p className="u_icon_company"></p>
              <Tabs
                onChange={this.changeBusinessType}
                activeKey={businessType}
                styleType={StyleType[1]}
                destroyInactiveTabPane={true}
              >
                {/* <Tabs.Pane key="live" tab={`网络直播`} style={{ padding: 16 }}>
                  <Live
                    roomId={roomId}
                    name={name}
                    roleType={role_type}
                    handleChangeRoomId={this.changeRoomId}
                    handleChangeName={this.changeName}
                    handleChangeRoleType={this.changeRoleType}
                    handleJoinRoom={this.joinRoom}
                  />
                </Tabs.Pane> */}
                <Tabs.Pane key="class" tab={`网上课堂`} style={{ padding: 16 }}>
                  <ClassRoom
                    roomId={roomId}
                    name={name}
                    roleType={role_type}
                    handleChangeRoomId={this.changeRoomId}
                    handleChangeName={this.changeName}
                    handleChangeRoleType={this.changeRoleType}
                    handleJoinRoom={this.joinRoom}
                  />
                </Tabs.Pane>
              </Tabs>
            </div>
          </Loading>
        </div>
        <DeviceTest target="login"></DeviceTest>
      </div>
    );
  }
}

export default Login;
