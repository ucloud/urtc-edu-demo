// @ts-nocheck
import React from "react";
import { Message, Modal } from "@ucloud-fe/react-components";
// import sdk from "urtc-sdk";
import {
  Client,
  sdk,
  getSupportProfileNames,
} from "../../common/serve/rtcServe";
import { rtcConfig } from "../../../config/rtcConfig";
import paramServer from "../../common/js/paramServer";
import "../../common/scss/index.scss";
import "./index.scss";

/**
 * @param roomId string
 * @param sid string
 * @param roleType string
 * @param getInfo  fun
 */

// const { Client } = sdk;

class RecordButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      recorded: false,
      recording: false,
      recordedParam: null,
      param: null,
      filename: null,
      region: rtcConfig.region,
      bucket: rtcConfig.bucket,
      isOpen: false,
    };
  }

  componentDidMount() {
    this.setState({
      param: paramServer.getParam(),
    });
  }

  startRecord = (e) => {
    const { roleType } = this.props;
    //录制权限 角色老师
    if (roleType !== 2) {
      Message.error("录制只能由老师开启，且只录一次");
      return;
    } else {
      this.setState({
        recording: true,
      });
      this.initRtc(2);
    }
  };

  stopRecord = (e) => {
    this.client.stopRecord((Error, Result) => {
      if (Error) {
        Message.error("结束失败");
        this.setState({
          redorded: false,
          recording: false,
        });
        alert(`结束失败 ${Error}`);
        return;
      } else {
        // Message.info(`录制已结束${this.renderAddress()}`);
        Modal.confirm(
          {
            title: "录制完成",
            onOk: () => console.log("ok"),
          },
          <div style={{ lineHeight: "40px" }}>
            <a
              rel="noopener noreferrer"
              target="_blank"
              href={this.renderAddress()}
            >
              回看地址
            </a>
          </div>
        );
        this.client.unpublish(() => {
          this.setState({
            redorded: false,
            recording: false,
            isOpen: true,
          });
        });
      }
    });
  };

  initRtc = (role_type) => {
    const { param, region, bucket } = this.state;
    let _roomId = param.roomId + "_recored";
    let _userId = param.userId + "_recored";
    let profileArr = getSupportProfileNames();
    let targetProfile = profileArr[profileArr.length - 1];
    const token = sdk.generateToken(
      param.appId,
      param.appkey,
      _roomId,
      _userId
    );
    const role =
      role_type === 0 ? "push" : role_type === 2 ? "push-and-pull" : "pull";
    this.client = new Client(param.appId, token, {
      type: "live",
      role: role,
    });
    profileArr.map((e) => {
      if (e.includes("720")) {
        targetProfile = e;
      }
      return "";
    });
    this.client.setVideoProfile(targetProfile, () => {
      this.client.on("stream-published", (stream) => {
        setTimeout(() => {
          this.client.startRecord(
            {
              bucket: bucket,
              region: region,
              streams: [
                {
                  uid: stream.uid,
                  mediaType: "screen",
                },
              ],
            },
            (err, result) => {
              if (err) {
                this.setState({
                  redorded: false,
                  recording: false,
                });
                alert(`录制失败 ${err}`);
                return;
              } else {
                console.log("录制桌面成功 >>>", result);
                this.setState({
                  redorded: true,
                  recording: false,
                  filename: result.FileName,
                });
              }
            }
          );
        }, 3000);
      });
      this.client.on("screenshare-stopped", () => {
        this.stopRecord();
      });
      this.client.on("record-notify", (Error, RecordResult) => {
        if (Error !== undefined) {
          alert(`录制失败: ${Error}`);
        }
      });
      this.client.joinRoom(_roomId, _userId, (users, streams) => {
        // this.client.setVideoProfile('1280*720');
        console.log("current users and streams in room ", users, streams);

        if (role === "pull") return;
        this.client.publish(
          {
            audio: false,
            video: false,
            screen: true,
          },
          (e) => {
            this.setState({
              redorded: false,
              recording: false,
            });
            console.log("publish failure ", e);
          }
        );
      });
    });
  };

  renderAddress() {
    const { filename, bucket, region } = this.state;
    return `http://${bucket}.${region}.ufileos.com/${filename}.mp4`;
  }

  render() {
    const { redorded, recording } = this.state;
    console.log(this.state, "???");
    return (
      <div className="record_btn">
        {!redorded ? (
          <span onClick={this.startRecord}>
            {recording ? "请求中" : "录制屏幕"}
          </span>
        ) : (
          <span onClick={this.stopRecord}>结束录制</span>
        )}
      </div>
    );
  }
}

export default RecordButton;
