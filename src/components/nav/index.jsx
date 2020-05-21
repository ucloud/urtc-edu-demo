// @ts-nocheck
/* eslint-disable */
import React from "react";
import { Row, Col, Icon, Tooltip } from "@ucloud-fe/react-components";
import { withRouter } from "react-router-dom";
import { randNum } from "../../common/util/index";

import { isHasUndefined } from "../../common/util/index.js";
import paramServer from "../../common/js/paramServer";
import RecordButton from "../../container/record/index";
import screenfull from "screenfull";
import { getSupportProfileNames } from "../../common/serve/rtcServe.js";

import "./index.scss";

class Nav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      param: null,
      desktopToggle: true,
      recordAuth: false,
    };
  }

  async componentDidMount() {
    let param = paramServer.getParam();
    this.setState({
      param,
    });
  }

  outRoom = () => {
    window.onbeforeunload = function (e) {
      return "确定离开此页吗？";
    };
    window.location.reload();
    return;
  };

  goUcloud = () => {
    window.open("http://www.ucloud.cn");
  };

  screen = () => {
    screenfull.toggle();
  };

  refushWrite = () => {
    console.log(">>>>refushWrite");
    this.props.refushWrite();
  };

  shareDesktop = () => {
    let arr = getSupportProfileNames();
    let profile = arr[arr.length - 1];

    //采用一条流来回切换的方式，比较快速实现
    let { desktopToggle } = this.state;
    window.p.on("screenshare-stopped", () => {
      console.log("screenshare-stopped is hahahh");
      this.setState({
        desktopToggle: true,
      });
      this.camera();
    });

    if (desktopToggle) {
      window.p.unpublish(
        () => {
          window.p.setVideoProfile(profile, () => {
            console.log("profile destop", profile);
            window.p.publish(
              {
                audio: false,
                video: false,
                screen: true,
              },
              (e) => {
                window.p.publish({
                  audio: true,
                  video: true,
                  screen: false,
                });
              }
            );
          });
        },
        () => {
          this.camera();
        }
      );
    } else {
      this.camera();
    }
    this.setState({
      desktopToggle: !desktopToggle,
    });
  };

  camera = () => {
    window.p.unpublish(() => {
      window.p.setVideoProfile("480*360", () => {
        window.p.publish({
          audio: true,
          video: true,
          screen: false,
        });
      });
    });
  };

  render() {
    const { param, desktopToggle, recordAuth } = this.state;
    const { monitorData } = this.props;
    return (
      <div className="nav_main">
        <Row gutter={0} style={{ padding: "0" }}>
          <Col span={8}>
            <div className="nav_title clearfix">
              <p className="">
                <span className="icon_wrapper " onClick={this.goUcloud}>
                  <span className="icon_wrapper_contain"></span>
                </span>
                <Icon type="file-video" />

                <span className="name_wrapper ft18 fw">
                  {param && (
                    <b>房间号: {param.roomId ? param.roomId : param.RoomId}</b>
                  )}
                </span>
                <span className="monitor_wrapper"></span>
              </p>
              <p className="fr"></p>
            </div>
          </Col>
          <Col span={4}>
            <div className="out_btn_wrapper clearfix">
              <span className="nav_btn fr" onClick={this.outRoom}>
                <b>
                  <Icon type="cross" />{" "}
                </b>
              </span>

              <span className="nav_btn fs16 fr" onClick={this.screen}>
                <b>
                  <Icon type="maximize" />{" "}
                </b>
              </span>

              <span
                className="nav_btn desktop fs16 fr"
                onClick={this.shareDesktop}
              >
                {desktopToggle ? "桌面分享" : "摄像头"}
              </span>

              {/* 第一个加入的老师有录制权限 */}
              {param && (
                <span className="nav_btn desktop fs16 fr">
                  <RecordButton
                    roomId={param.roomId}
                    roleType={param.role_type}
                    userId={param.userId}
                  />
                </span>
              )}
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default withRouter(Nav);
