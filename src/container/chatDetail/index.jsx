// @ts-nocheck
/* 
    聊天内容纯组件
    params：props : {
        content
        name
        id
        isUser,
        createTime 排序
    }
*/
import React from "react";
import { Icon, Tooltip } from "@ucloud-fe/react-components";
import "../../common/scss/index.scss";
import "./index.scss";

function ranColor() {
  let r = Math.floor(Math.random() * 255),
    g = Math.floor(Math.random() * 255),
    b = Math.floor(Math.random() * 255);
  return "rgba(" + r + "," + g + "," + b + ",0.8)";
}

class ChatDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      param: null,
      color: ranColor()
    };
  }

  render() {
    return (
      <div className="chat_detail_wrapper">
        <div
          className={
            this.props.isUser ? " chat_detail_name r" : "chat_detail_name l"
          }
        >
          <span>{this.props.name ? this.props.name : this.props.id}</span>
        </div>
        <div
          className="chat_detail clearfix"
          style={{ textAlign: this.props.isUser ? "right" : "left" }}
        >
          <span
            className={
              this.props.isUser
                ? "fr chat_detail_head clearfix"
                : "clearfix fl chat_detail_head"
            }
          >
            <span
              // style={{ backgroundColor: this.state.color }}
              className={
                this.props.isUser ? "fr user_head_bg" : "fl user_head_bg"
              }
            ></span>

            <span
              style={{ lineHeight: "24px", fontSize: "12px" }}
              className={this.props.isUser ? "fr " : "fl "}
            >
              :{" "}
            </span>
          </span>
          <p
            className={
              this.props.isUser ? "fr user_message" : "fl user_message"
            }
          >
            {!this.props.status ? (
              <Tooltip popup={<p>发送消息失败</p>} trigger="hover">
                <Icon
                  style={{ height: "30px", width: "30px", color: "red" }}
                  type="location"
                />
              </Tooltip>
            ) : null}
            {this.props.content}
          </p>
        </div>
      </div>
    );
  }
}

export default ChatDetail;
