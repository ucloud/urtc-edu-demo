import React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {
  Input,
} from "@ucloud-fe/react-components";
import './index.scss';

export default class Clipboard extends React.Component {
  constructor(props) {
    super(props);
    const { roomId } = this.props;
    let origin = window.location.origin;
    let pathname = window.location.pathname;
    let type = pathname.substring(1, pathname.length);
    let share = `${origin}/share?type={}`
    switch(type) {
      case 'class':
        share = `${origin}/share?type=class&roomId=${roomId}`;
        break;
      case 'liveroom':  // live 模式下，主播的页面
      default:
        share = `${origin}/share?type=live&roomId=${roomId}`;
    }
    this.state = {
      share:encodeURI(share),
      copied: false
    };
  }

  render() {
    const { share } = this.state;
    return (
      <div className="clipboard">
        <span>分享链接：</span>
        <Input className="copy-text" disabled={true} defaultValue={share}/>
        <CopyToClipboard className="copy-btn" text={share}
          onCopy={() => this.setState({copied: true})}>
          <span>复制</span>
        </CopyToClipboard>
      </div>
    )
  }
}