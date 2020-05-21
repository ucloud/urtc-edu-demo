// @ts-nocheck
/* eslint-disable */
import React from "react";
import "./index.scss";
import ReactPlayer from "react-player";
import paramServer from "../../common/js/paramServer";
import { imClient } from "../../common/serve/imServe";
import { exitFullScreen, openFullscreen, is_ios } from "../../common/util/index";
import { findDOMNode } from "react-dom";

class SubscribeVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: false,
      params: null,
      show: false,
      is_ios:is_ios(),
    };
  }

  componentWillMount() {
    let param = paramServer.getParam();
    console.log("param", param);

    this.setState({
      params: param
    });

    //麦序有人，显示
    if (param.roomInfo.applayList && param.roomInfo.applayList.length) {
      this.setState({
        show: true
      });
    }

    imClient.on("CallReply", data => {
      let { replyuserid, operation } = data;
      let params = paramServer.getParam();
      if (operation === "agree") {
        this.setState({
          show: true
        });
      }
    });

    imClient.on("CallApply", data => {
      let LENGTH = data ? data.length : 0;
      console.log("CallApply", LENGTH, data);
      if (LENGTH == 0) {
        this.setState({
          show: false
        });
      } else {
        this.setState({
          show: true
        });
      }
    });

    //监听房间连麦状态, 关闭订阅列表
    imClient.on("CallAuth", data => {
      if (data.operation == "close") {
        this.setState({
          show: false
        });
      }
    });
  }

  componentWillReceiveProps() {
    this.data = this.props;
  }

  fullScreen = index => {
    console.log("full screen success");
    openFullscreen(findDOMNode(this.player));
  };

  filterStudentStream = () => {
    const { data = [] } = this.props;
    const { params } = this.state;
    if (!data.length) {
      return [];
    }

    let teachList = params.adminList.map(e => {
      return e.UserId;
    });
    let studentList = [];
    data.map(e => {
      if (!teachList.includes(e.uid)) {
        studentList.push(e);
      }
    });
    return studentList;
  };

  filterUserName = userId => {
    const { params } = this.state;
    let name = "";
    let admin_arr = imClient.getAdminUsers();
    let d_arr = imClient.getDefaultUsers();
    console.log(">>>users users suers", admin_arr, d_arr);
    if (!d_arr && !admin_arr) {
      return name;
    }
    let totalArr = admin_arr.concat(d_arr);
    totalArr.map(e => {
      if (e.UserId == userId) {
        name = e.UserName;
      }
    });
    return name;
  };
  // ref = (player,index) => {
  //   console.log('bind player',index)
  //   this.player[index] = player;
  // };
  render() {
    const subArr = this.props.data;
    const local = this.props.local;
    const { params, show, is_ios } = this.state;
    let { adminList = [] } = params;
    let adminId = adminList.map(e => {
      return e.UserId;
    });

    return (
      <div>
        {show ? (
          <div className="subscribe">
            <div className="subscribe_content">
              {params.role_type == 1 && local ? (
                <div
                  className="video_wrapper"
                  style={{ display: "inline-block", marginRight: "5px" }}
                >
                  <div className="name_wrapper">
                    <span className="head"></span>
                    <span className="text">
                      {this.filterUserName(local.uid)}
                    </span>
                  </div>
                  <ReactPlayer
                    width="100%"
                    height="100%"
                    url={local.mediaStream}
                    playing
                    key={local.sid}
                    controls={is_ios}
                    autoplay
                    playsinline
                    muted={true}
                  />
                  <div className="video_userInfo hide">
                    <span
                      className="head_bg"
                      style={{ backgroundColor: this.state.color }}
                    ></span>
                  </div>
                </div>
              ) : null}
              {this.filterStudentStream().map((e, v) => {
                if (!adminId.includes(e.uid)) {
                  return (
                    <div
                      className="video_wrapper"
                      style={{ display: "inline-block", marginRight: "5px" }}
                      key={v}
                    >
                      <ReactPlayer
                        width="100%"
                        height="100%"
                        url={e.mediaStream}
                        playing
                        key={e.sid}
                        controls={is_ios}
                        // ref={this.ref(this,v)}
                        muted={false}
                        autoplay
                        playsinline
                        style={{ position: "relative" }}
                      />
                      <div className="name_wrapper">
                        <span className="head"></span>
                        <span className="text">
                          {this.filterUserName(e.uid)}
                        </span>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default SubscribeVideo;
