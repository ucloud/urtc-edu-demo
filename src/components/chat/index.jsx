// @ts-nocheck
/* eslint-disable */

import React from "react";
import "./index.scss";
import {
  Loading,
  Input,
  Icon,
  Button,
  Tabs,
  Textarea,
  Checkbox
} from "@ucloud-fe/react-components";
import axios from "axios";
import paramServer from "../../common/js/paramServer";
import ChatDetail from "../../container/chatDetail";
import StudentItem from "../studentItem/index";
import ApplyCall from "../applyCall";
import CallList from "../callList";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache
} from "react-virtualized";
import { imClient } from "../../common/serve/imServe.js";
import { getSupportProfileNames } from "../../common/serve/rtcServe.js";
import { IsPC } from "../../common/util/index";
const cache = new CellMeasurerCache({ defaultHeight: 28, fixedWidth: true,minHeight: 46, });
let num = 0;
let i = 0

let isUnmount = true;
class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      param: null,
      imConfig: null,
      imInfo: null,
      contectConfig: null,
      messageValue: "",
      chatList: [],
      disableChatBtnStatus: true, //全员禁言 ，false 解除禁言
      userList: [],
      teachList: [],
      applyStatus: true, //false 关闭 open 开启
      ReplyUserState: null,
      applyuserid: "",
      callteamlist: [],
      isRtcList: [],
      roomInfo: null,
      tabsKey: "1",
      scrolling_pos: 0,
      applyShow: true, // 教师连麦哦部分 现实隐藏
      ReplyUserState: null,
      replyShow: false, //学生上麦按钮显示
      chatPending: false
    };
    // window.ws = null;
    this.chatList = React.createRef();
    this.userList = React.createRef();
  }

  componentDidMount() {
    let param = paramServer.getParam();
    isUnmount = false;
    let _this = this;
    if (param === null) {
    } else {
      this.setState(
        {
          param: param,
          loading: false,
          callteamlist: param.roomInfo.applayList
            ? param.roomInfo.applayList
            : []
        },
        () => {
          // ws
          // 绑定消息处理方法
          imClient.getHistoryChat(
            0,
            20,
            0,
            data => {
              console.log("getHistoryChat", data);
              let arr = data.filter(e => {
                return e !== undefined;
              });
              this.setState({
                loading: false,
                chatList: arr,
                scrolling_pos: arr.length - 1
              });
            },
            data => {
              console.log("getHistoryChat error", data);
            }
          );
          // 接收消息
          this.imBindEvent("Msg");
          // 发送失败
          this.imBindEvent("SendMsgFail");
          //接收自定义消息
          this.imBindEvent("CustomContent");
          //用户加入绑定坚挺
          this.imBindEvent("Users");
          if (param !== null) {
            let roomInfo = imClient.getRoomInfo();
            console.log("roomInfo", roomInfo);
            this.setState({
              param: param,
              roomInfo: roomInfo
            });
          }

          imClient.on("CallApply", data => {
            this.setState({
              callteamlist: data,
              tabsKey: "2"
            });
          });
          imClient.on("CallReply", data => {
            console.log('data.operation',data)
            if(data.operation == "refuse"){
              let arr = this.state.callteamlist.filter(e => {
                return  e.UserId !== data.replyuserid
              })

              let o = this.state.roomInfo
              o.applayList = arr
              paramServer.setParam(Object.assign(this.state.param, {
                roomInfo:{...o}
              }));
              this.setState({
                callteamlist: arr,
              });
            }
          });
          
        //  this.timer =  setInterval(() => {
        //    i++
        //    if(i > 550){
        //      clearInterval(this.timer)
        //    }
        //     imClient.sendMsg(`测试消息${i}`, () => {
             
        //     });
        //   },100)

          imClient.on("Users", data => {
            console.log("users:", data);
            this.setState({
              userList: data.defaultUsers
            });
          });
        }
      );
    }
  }
  imBindEvent = type => {
    imClient.on(type, data => {
      console.log("type>>>:", type, data);
      this.wsConfig()[type](data);
    });
  };

  unbindEvent = type => {
    imClient.off(type);
  };

  // 封装ws接受消息处理的方法
  wsConfig = () => {
    let tempChatList = [];
    let flag = false;
    return {
      Msg: data => {
        num += 1;
        let { chatList } = this.state;
        let arr = chatList;
        arr.push(data);
        console.log("chatList>>>", data, tempChatList, arr, num);

        setTimeout(() => {
          this.setState({
            chatList: arr,
            scrolling_pos: arr.length - 1
          });
        }, 100);
      },
      Users: data => {
        this.setState({
          adminList: data.AdminUsers,
          usersList: data.defaultUsers
        });
      },
      //自定义消息
      CustomContent: data => {
        const detail = JSON.parse(data.content);
        // console.log("detail>>>>:" ,detail)
        if (!detail.jumpUrl) {
          return;
        }
        this.setState({
          customDetailShow: true,
          customDetail: detail
        });
        if (detail.showTime) {
          setTimeout(() => {
            this.setState({
              customDetailShow: false
            });
          }, detail.showTime * 1000);
        }
      },
      SendMsgFail: data => {
        console.log("SendMsgFail", data);
        this.setState({
          chatList: data.historyChat,
          scrolling_pos: data.historyChat.length - 1
        });
      }
    };
  };

  // 卸载组件
  componentWillUnmount() {
    isUnmount = true;
  }

  changeMegValue = e => {
    this.setState({
      messageValue: e.target.value
    });
  };
  // 输入框监听keyup 发送消息
  sendMeg = e => {
    // 暂时没做报错处理
    if (e.keyCode === 13 && e.shiftKey && e.target.value !== "") {
      this.setState(
        {
          messageValue: e.target.value
        },
        () => {
          this.sendMessage();
        }
      );
    }
  };
  // 按钮发送消息
  sendMessage = () => {
    let str = this.state.messageValue;
    str = str.replace(/\r\n/g, "<br/>"); //IE9、FF、chrome
    str = str.replace(/\n/g, "<br/>"); //IE7-8
    str = str.replace(/\s/g, " ");
    let strArr = str.split("<br/>");

    let isAllBr = true; //判断字符串是否全是换行空格，
    strArr.map(e => {
      if (e !== "") {
        isAllBr = false;
      }
    });
    console.log("send msg", str);
    if (isAllBr) {
      return;
    }
    this.setState({
      chatPending: true
    });
    imClient.sendMsg(this.state.messageValue, () => {
      this.setState({
        messageValue: "",
        chatPending: false
      });
    });
  };

  //聊天室禁言
  disableChat = () => {
    let flag = this.state.disableChatBtnStatus;
    imClient.banRoom(flag ? "ban" : "unban", null, data => {
      console.log(">>>ban", flag, data);
      this.setState({
        disableChatBtnStatus: !flag
      });
    });
  };

  renderCallteamlist = arr => {
    console.log("renderCallteamlist", arr);
    let RtcList = [];
    if (window.p) {
      RtcList = window.p.getUsers().map(e => {
        return e.uid;
      });
    }
    if (arr && arr.length > 0) {
      return arr.map((e, index) => {
        console.log(RtcList.includes(e.UserId), e, RtcList);
        return (
          <CallList
            inRtc={RtcList.includes(e.UserId)}
            isAdmin={this.state.param.role_type}
            key={index}
            num={index}
            data={e}
          />
        );
      });
    } else {
      return [];
    }
  };

  updateCallteamlist = obj => {
    let o = paramServer.getParam();
    paramServer.setParam(Object.assign(o, obj));
  };

  componentWillUnmount() {
    // window.ws = null;
  }

  rowRenderer = ({ key, index, isScrolling, isVisible, style, parent }) => {
    const param = paramServer.getParam();
    const e = this.state.chatList[index];
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <div key={key} style={style}>
          <ChatDetail
            key={index}
            num={index}
            content={e.message}
            userType={e.userType}
            isUser={e.userId === param.userId}
            // time={null}
            id={e.userid}
            name={e.userName}
            status={e.status}
          />
        </div>
      </CellMeasurer>
    );
  };
  changeTab = e => {
    console.log(e);
    this.setState({
      tabsKey: e
    });
  };

  chatAraeCss = () => {
    //直播模式为聊天室，别的为适配
    const { param } = this.state;
    if (!param) {
      return true;
    }

    let { businessType, role_type } = param;
    console.log("businessType>>>>", businessType);
    if (businessType === "live") {
      return true;
    } else {
      if (role_type == 2) {
        return true;
      } else {
        return false;
      }
    }
  };

  render() {
    const {
      loading,
      messageValue,
      chatList,
      param,
      disableChatBtnStatus,
      userList = [],
      applyStatus,
      ReplyUserState,
      applyuserid,
      callteamlist,
      roomInfo,
      scrolling_pos,
      applyShow,
      ReplyButton,
      replyShow,
      tabsKey,
      chatPending
    } = this.state;
    console.log("this.props", chatList);
    let micFlag = paramServer.getParam().role_type == 1 && applyStatus;
    let tabK = "1";
    if (param && param.businessType == "live") {
      tabK = "1";
    } else {
      tabK = tabsKey;
    }
    console.log("getSupportProfileNames", getSupportProfileNames());
    return (
      <div className="chat_main">
        <Loading loading={loading} style={{ height: "100%", width: "100%" }}>
          {this.chatAraeCss() ? (
            <div className="chat_list_wrapper">
              <ApplyCall show={applyShow} urtcInit={this.props.urtcInit} />

              <Tabs
                tabBarPosition={"top"}
                styleType="ink"
                defaultActiveKey={"1"}
                onChange={this.changeTab}
                activeKey={tabsKey}
                // style={{ backgroundColor:'#1166E4',color:'#ffffff',fontSize:'14px'}}
              >
                <Tabs.Pane key={"1"} tab={"聊天"} style={{ padding: 16 }}>
                  <div style={{}}>
                    <div
                      className={
                        paramServer.getParam().role_type == 2 || micFlag
                          ? // ? "chat_list"
                            "chat_list"
                          : "chat_list top31"
                      }
                      ref={this.chatList}
                    >
                      <AutoSizer>
                        {({ height, width }) => (
                          <List
                            height={height}
                            rowCount={chatList.length}
                            rowHeight={cache.rowHeight}
                            overscanRowCount={20}
                            deferredMeasurementCache={cache}
                            scrollToIndex={scrolling_pos}
                            rowRenderer={this.rowRenderer}
                            width={width}
                          />
                        )}
                      </AutoSizer>
                    </div>

                    <div className="chat_list_content">
                      <div className="input clearfix">
                        <div className="text_wrapper">
                          <Loading loading={chatPending}>
                            <Textarea
                              onChange={this.changeMegValue}
                              onKeyDown={this.sendMeg}
                              placeholder="Enter + Shift 发送消息"
                              value={messageValue}
                              rows="3"
                              size={"lg"}
                              style={{ width: "100%", borderRadius: "5px" }}
                            />
                          </Loading>
                        </div>
                        <div
                          className="btn_wrapper clearfix"
                          style={{ padding: "0 7px" }}
                        >
                          <Button
                            onClick={this.sendMessage}
                            size="sm"
                            loading={chatPending}
                            className="sendBtn fr"
                            styleType="primary"
                          >
                            发送
                          </Button>
                          <Checkbox
                            disabled={param && param.role_type != 2}
                            styleType="border-gray"
                            checked={!disableChatBtnStatus}
                            onClick={this.disableChat}
                          >
                            禁止发言
                          </Checkbox>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tabs.Pane>
                {paramServer.getParam().businessType !== "live" ? (
                  <Tabs.Pane
                    key={"0"}
                    tab={"学生(" + userList.length + ")"}
                    style={{ padding: 16 }}
                  >
                    <div style={{}}>
                      <div
                        className={
                          paramServer.getParam().role_type == 2 || micFlag
                            ? "user_list "
                            : "user_list top31"
                        }
                        ref={this.userList}
                      >
                        {userList.map((e, index) => {
                          return (
                            <StudentItem
                              key={index}
                              data={e}
                              isTeacher={e.UserType === "admin"}
                              id={e.UserId}
                              name={e.UserName}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </Tabs.Pane>
                ) : null}

                {paramServer.getParam().role_type == 2 && (
                  <Tabs.Pane key={"2"} tab={"连麦"} style={{ padding: 16 }}>
                    <div style={{}}>
                      <div
                        className={
                          paramServer.getParam().role_type == 2 || micFlag
                            ? "callList"
                            : "callList top31"
                        }
                      >
                        {this.renderCallteamlist(callteamlist)}
                      </div>
                    </div>
                  </Tabs.Pane>
                )}
              </Tabs>
            </div>
          ) : (
            <div
              className={
                this.props.closeLeft ? "student_class mr5" : "student_class"
              }
            >
              <div
                className="close"
                onClick={() => {
                  this.props.close && this.props.close();
                }}
              >
                <span className="icon__arrow-left"></span>
              </div>
              <div className="student_chat_header">
                <Icon
                  type="wechat"
                  style={{ fontSize: "22px", marginRight: "10px" }}
                />
                <span className="text">聊天区</span>
              </div>
              <div
                className={"chat_list"}
                style={{ paddingBottom: "30px" }}
                ref={this.chatList}
              >
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      rowCount={chatList.length}
                      rowHeight={cache.rowHeight}
                      overscanRowCount={18}
                      deferredMeasurementCache={cache}
                      scrollToIndex={scrolling_pos}
                      rowRenderer={this.rowRenderer}
                      width={width}
                    />
                  )}
                </AutoSizer>
              </div>

              <div className="chat_list_content">
                <p className="input">
                  <Loading loading={chatPending}>
                    <Input
                      onChange={this.changeMegValue}
                      onKeyDown={this.sendMeg}
                      value={messageValue}
                      size={"lg"}
                      placeholder={IsPC() ? "shift + enter 发送消息" : ""}
                      style={{ width: "100%" }}
                      icon={
                        <Button
                          onClick={this.sendMessage}
                          size="lg"
                          loading={chatPending}
                          className="sendBtn1"
                          styleType="primary"
                        >
                          发送
                        </Button>
                      }
                    />
                  </Loading>
                </p>
              </div>
            </div>
          )}
        </Loading>
      </div>
    );
  }
}

export default Chat;
