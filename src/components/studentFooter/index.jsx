// @ts-nocheck
/* eslint-disable */
import React from "react";
import { Row, Col, Icon } from "@ucloud-fe/react-components";
import { withRouter } from "react-router-dom";
import { randNum } from "../../common/util/index";

import { isHasUndefined } from "../../common/util/index.js";
import StudentApplyCall from "../studentApplyCall/index";
import paramServer from "../../common/js/paramServer";
import screenfull from "screenfull";

import "./index.scss";
import { imClient } from "../../common/serve/imServe.js";

class StudentFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      param: null,
      userNum: 0,
      adminNum: 0,
    };
  }

  componentDidMount() {
    let param = paramServer.getParam();
    console.log("StudentFooter", param);
    if (param.roomId) {
      console.log("param", param);
      this.setState({
        param,
        defaultNum: param.defaultList.length,
        adminNum: param.adminList.length,
        userNum: param.defaultList.length + param.adminList.length,
      });
    }

    imClient.on("Users", (data) => {
      console.log("User:>>>", data);
      this.setState({
        userNum: data.defaultUsers.length + data.adminUsers.length,
        adminNum: data.adminUsers.length,
        defaultNum: data.defaultUsers.length,
      });
    });

    console.log("roomInfo", param.roomInfo);
  }

  outRoom = () => {
    window.onbeforeunload = function (e) {
      return "确定离开此页吗？";
    };
    window.location.reload();
  };

  goUcloud = () => {
    window.open("http://www.ucloud.cn");
  };

  screen = () => {
    screenfull.toggle();
  };

  render() {
    const { userNum } = this.state;
    let param = paramServer.getParam();
    return (
      <div
        className={paramServer.getParam().role_type == 1 ? "studentFooter" : ""}
      >
        {paramServer.getParam().role_type == 1 && (
          <Row gutter={0} style={{ padding: "0" }}>
            <Col span={6}>
              <div className="btn_left_wrapper">
                {/* <span 
                                    style={{height:'33px',verticalAlign:"top",lineHeight:'46px'}}
                                    className="icon_wrapper" onClick={() => this.props.changeLayout()}>
                                    <Icon type="copy"></Icon>
                                </span> */}
                <span className="icon_wrapper">
                  <StudentApplyCall />
                </span>
              </div>
            </Col>
            <Col span={6}>
              <div className="btn_right_wrapper">
                <span className="icon_wrapper">
                  <Icon type="zjrz" />
                  <b>{userNum}</b>
                  {/* {param && JSON.stringify(param)} */}
                </span>
                <span className="icon_wrapper" onClick={this.outRoom}>
                  <b>{param.roomId}</b>
                  <Icon type="esc" />
                </span>
              </div>
            </Col>
          </Row>
        )}
      </div>
    );
  }
}

export default withRouter(StudentFooter);
