// @ts-nocheck
/* eslint-disable */
import React from "react";
import {
  Icon,
  Switch,
  Button,
  Tooltip,
  Popover,
} from "@ucloud-fe/react-components";
import paramServer from "../../common/js/paramServer";
import { is_ios } from "../../common/util/index";
import "./index.scss";
import { imClient } from "../../common/serve/imServe.js";

let penging = false;
class StudentApplyCall extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      param: null,
      modalHide: false,
      applyCallStatu: true,
      onlineOnce: false,
      is_ios: is_ios(),
    };
  }

  componentDidMount() {
    let param = paramServer.getParam();
    if (param.roomId) {
      this.setState({
        param,
        modalHide: param.roomInfo.CallOperation === "open",
      });
    }

    imClient.on("CallReply", (data) => {
      let { param } = this.state;
      let { replyuserid, operation } = data;
      console.log("param.userId === replyuserid", param.userId, replyuserid);
      if (param.userId === replyuserid && operation === "refuse") {
        this.setState({
          applyCallStatu: true,
        });
      }
    });

    imClient.on("CallAuth", (data) => {
      if (data.operation == "close" && paramServer.getParam().role_type == 1) {
        imClient.applyCall(param.userId, "cancel");
        this.setState({
          modalHide: false,
          applyCallStatu: true,
        });
      } else if (
        data.operation != "close" &&
        paramServer.getParam().role_type == 1
      ) {
        this.setState({
          modalHide: true,
        });
      }
    });
  }

  openCall = (e) => {
    if (penging) {
    } else {
      penging = true;
    }
    AuthCall(true).then((data) => {
      penging = false;
    });
  };

  closeCall = (e) => {
    if (penging) {
    } else {
      penging = true;
    }
    AuthCall(false).then((data) => {});
  };

  checkTeach() {
    const param = paramServer.getParam();
    if (param == null || !param.hasOwnProperty("teachList")) {
      return false;
    }
    let arr = param.teachList.map((e) => {
      return e.UserId;
    });
    let id = param.UserId;

    return arr.includes(id);
  }

  applyCall = () => {
    let { userInRtc, param } = this.state;
    let flag = this.state.applyCallStatu;
    this.setState({
      applyCallStatu: !flag,
    });
    if (!flag) {
      imClient.applyCall(param.userId, "cancel");
    }
    imClient.applyCall(param.userId, flag ? "apply" : "cancel", (data) => {
      if ((param.userId, userInRtc)) {
        this.props.urtcInit();
      }
      this.setState({
        userInRtc: !userInRtc,
        applyCallStatu: !flag,
        onlineOnce: true,
      });
    });
  };

  render() {
    const param = paramServer.getParam();
    const {
      applyuserid,
      applyStatus,
      isRtcLists,
      ReplyUserState,
      userInRtc,
    } = paramServer.getParam();
    let { applyCallStatu, modalHide, is_ios } = this.state;
    let isTeach = this.checkTeach();
    console.log("is_ios>>>", is_ios);
    return (
      <div className="student_applycall_main clearfix">
        {!is_ios && param && modalHide && (
          <div className="w100">
            <span onClick={this.applyCall} className="tip">
              {applyCallStatu ? "申请上麦" : "取消连麦"}
            </span>
          </div>
        )}
      </div>
    );
  }
}

export default StudentApplyCall;
