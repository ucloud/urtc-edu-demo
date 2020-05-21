// @ts-nocheck
/* eslint-disable */
import React from "react";
import { Button, Icon } from "@ucloud-fe/react-components";
import paramServer from "../../common/js/paramServer";
import { imClient } from "../../common/serve/imServe.js";

import "./index.scss";
function ranColor() {
  let r = Math.floor(Math.random() * 255),
    g = Math.floor(Math.random() * 255),
    b = Math.floor(Math.random() * 255);
  return "rgba(" + r + "," + g + "," + b + ",0.8)";
}

class StudentItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      param: null,
      color: ranColor(),
      isDisable: false,
    };
  }

  componentDidMount() {
    let param = paramServer.getParam();
    this.setState({
      param,
    });
  }

  render() {
    const { param, isDisable } = this.state;
    const { id, name, isTeacher } = this.props;
    console.log(this.props);
    return (
      <div className="studentItem_main clearfix">
        <div className="studentItem_content fl">
          <p className="studentItem_head">
            <span
              className="studentItem_head_bg"
              style={{ backgroundColor: this.state.color }}
            ></span>
            <span className="studentItem_head_name">{name ? name : id}</span>
          </p>
        </div>
      </div>
    );
  }
}

export default StudentItem;
