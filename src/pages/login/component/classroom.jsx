// @ts-nocheck
import React from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Radio,
  Button,
  Select,
} from "@ucloud-fe/react-components";

const { Item } = Form;

export default class ClassRoom extends React.Component {
  constructor(props) {
    super(props);
    this.formLable = {
      roomId: "课堂号",
      name: "名字",
      character: [
        { key: "2", value: "老师" },
        { key: "1", value: "学生" }
        // { key: '2', value: '监查', },
      ],
      submit: "加入",
      crouseType: [
        { key: "1", value: "大班课" }
        // { key: '0', value: '小班课', },
      ]
    }
  }

  changeRoomtype = e => {
    const { handleChangeRoomType } = this.props;
    handleChangeRoomType && handleChangeRoomType(e);
  }

  changRoomId = e => {
    const { handleChangeRoomId } = this.props;
    handleChangeRoomId && handleChangeRoomId(e.target.value);
  }

  changName = e => {
    const { handleChangeName } = this.props;
    handleChangeName && handleChangeName(e.target.value);
  }

  changeRoleType = e => {
    const { handleChangeRoleType } = this.props;
    handleChangeRoleType && handleChangeRoleType(e);
  }

  joinRoom = () => {
    const { handleJoinRoom } = this.props;
    handleJoinRoom && handleJoinRoom();
  }

  render() {
    const { roomId, name, roleType } = this.props;

    return (
      <Row>
        <Col span={8}>
          <Form size="md" style={{ textAlign: "left" }}>
            <Item label="课程类型">
              <Select
                className="input"
                defaultValue={'1'}
                onChange={this.changeRoomtype}
              >
                {this.formLable.crouseType.map((v, index) => (
                  <Select.Option
                    key={index}
                    value={v.key}
                    style={{ width: "151px" }}
                  >
                    {v.value}
                  </Select.Option>
                ))}
              </Select>
            </Item>
            <Item label={this.formLable.roomId}>
              <Input
                defaultValue=''
                value={roomId}
                size="md"
                className="input"
                placeholder="请输入课堂号"
                onChange={this.changRoomId}
              />
            </Item>
            <Item label={this.formLable.name}>
              <Input
                size="md"
                className="input"
                placeholder="请输入姓名"
                defaultValue=''
                value={name}
                onChange={this.changName}
              />
            </Item>
            <Item label="">
              <Radio.Group
                onChange={this.changeRoleType}
                defaultValue='2'
                value={roleType}
              >
                {this.formLable.character.map((v, index) => (
                  <Radio key={index} value={v.key}>
                    {v.value}
                  </Radio>
                ))}
              </Radio.Group>
            </Item>
          </Form>
          <Button className="submit_btn" onClick={this.joinRoom}>
            <span className="text">{this.formLable.submit}</span>
          </Button>
        </Col>
      </Row>
    )
  }
}
