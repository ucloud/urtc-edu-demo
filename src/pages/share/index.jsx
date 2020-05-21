// @ts-nocheck
/* eslint-disable */
import React from "react";
import "./index.scss";
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Loading
} from "@ucloud-fe/react-components";
import { randNum } from "../../common/util/index";
import axios from "axios";
import paramServer from "../../common/js/paramServer";
import { createClient, imClient } from "../../common/serve/imServe.js";
import Querystringify from "querystringify";
import { setCookie, } from "../../common/js/cookie";
import DeviceTest from "../deviveTest/index";
import {
  is_weixin,
  is_ios,
} from "../../common/util/index";

let appData = {};
// paramServer.setParam( appData);

export default class Share extends React.Component {
  constructor(props) {
    super(props);
    const query = Querystringify.parse(props.location.search);
    const { type = "live", roomId = "" } = query;
    this.state = {
      role_type: "1", // 0: 推流，1: 拉流，2: 推拉流
      room_type: "1", // 0: RTC，1: Live
      loading: false,
      disabled: false,
      businessType: type, // live: 网络直播，class: 网上课堂
      roomId: roomId,
      name: "",
      query: query,
      // is_ios_weixin: is_weixin() && is_ios(),
      is_ios_weixin: false,

    };
  }

  componentDidMount() {
    const { roomId, businessType } = this.state;
    setCookie("businessType", businessType, 60 * 24 * 60);
    setCookie("role_type", 1, 60 * 24 * 60);
    console.log("share>>>", businessType);
    setCookie("roomId", roomId, 60 * 24 * 60);
    if (!roomId) {
      // this.props.history.push({ pathname: "/" });
    }
  }
  

  changName = e => {
    this.setState({ name: e.target.value });
  };

  joinRoom = () => {
    console.log("joinRoom is task >>");
    appData = {
      appId: "URtc-h4r1txxy",
      userId: randNum(8),
      // userId: '333',
      mediaType: "1", //桌面和摄像头采集类型
      appkey: "9129304dbf8c5c4bf68d70824462409f"
    };
    const { room_type, role_type, roomId, name, businessType } = this.state;
    this.setState({
      loading: true
    });
    setCookie("name", name, 60 * 24 * 60);
    // setCookie("userId", appData.userId);
    console.log("share>>>", businessType);
    let param = {
      room_type,
      role_type,
      roomId,
      name,
      businessType,
      ...appData
    };
    this.joinIM(param);
  };

  //加入im房间
  joinIM(param) {
    createClient(appData.appId);
    let type = "admin";
    if (param.room_type == 1) {
      //大班课
      type = param.role_type == 2 ? "admin" : "default";
    }
    imClient.joinRoom(
      param.roomId,
      param.userId,
      type,
      param.name,
      data => {
        imClient.createWhite(whiteData => {
          let { uuid, token } = whiteData;
          
          paramServer.setParam(
            Object.assign(
              {
                defaultList: data.defaultUsers,
                adminList: data.adminUsers,
                roomInfo: data.roomInfo,
                Token: token,
                Uuid: uuid
              },
              param
            )
          );
          this.setState({
            loading: false
          });
          const { businessType } = this.state;
          console.error("businessType", businessType);
          switch (businessType) {
            case "class":
              this.props.history.push({ pathname: `/student` });
              break;
            case "live":
            default:
              this.props.history.push({ pathname: `/live` });
          }
        });
      },
      err => {
        console.error("im joinroom:::", err);
      }
    );
  }

  goUcloud = () => {
    window.open("www.ucloud.cn");
  };

  checkKey = e => {
    if (e.target.nodeName === "INPUT" && e.keyCode === 13) {
      console.log("join room start");
      this.joinRoom();
    }
  };

  render() {
    const { name, roomId, loading, businessType,is_ios_weixin } = this.state;
    let welcomeTxt = "";
    let submitBtn = "";
    switch (businessType) {
      case "class":
        welcomeTxt = "课堂：";
        submitBtn = "进入课堂";
        break;
      case "live":
      default:
        welcomeTxt = "直播间：";
        submitBtn = "进入直播间";
    }
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
              <div className="welcome">
                <span className="welcome-label">欢迎进入{welcomeTxt}</span>
                <span className="welcome-content">{roomId}</span>
              </div>
              <Row>
                <Col span={8}>
                  <Input
                    size="md"
                    className="input"
                    placeholder="请输入姓名"
                    value={name}
                    onChange={this.changName}
                    onKeyUp={this.checkKey}
                  />
                  <Button className="submit_btn" onClick={this.joinRoom}>
                    <span className="text">{submitBtn}</span>
                  </Button>
                  <p className="title_info">推荐使用Chrome、Safari浏览器</p>

                </Col>
              </Row>
            </div>
          </Loading>
        </div>
        <DeviceTest  target="share"></DeviceTest>
        <div className={is_ios_weixin? "is_ios_weixin_mask show" : "is_ios_weixin_mask hide"}>
          <p class="wxtip-txt">点击右上角<br/>选择在浏览器中打开 <br/>推荐使用Chrome、Safari浏览器</p>
        </div>
      </div>
    );
  }
}
