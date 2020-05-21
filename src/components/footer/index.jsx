// @ts-nocheck
// eslint-disable-next-line
/* eslint-disable */
import React from 'react';
import paramServer from '../../common/js/paramServer';
import './index.scss';
import { imClient } from "../../common/serve/imServe.js";

import Clipboard from '../clipboard';

class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            param: null,
            modalHide: false,
            callteamlist: [],
            cpu:'',
            userNum:0,
            adminNum:0,
            defaultNum: 0,
        };
    }

    componentDidMount() {
        let param = paramServer.getParam();

        if (param.roomId) {
            console.log("Footer",param)
            this.setState({
                param,
                defaultNum:param.defaultList.length,
                adminNum: param.adminList.length,
                userNum: param.defaultList.length + param.adminList.length,
            })
        }

        imClient.on("Users",data => {
            console.log('User:>>>',data)
            this.setState({
                userNum: data.defaultUsers.length + data.adminUsers.length,
                adminNum:data.adminUsers.length,
                defaultNum: data.defaultUsers.length,
            })
         })

        let _this = this;
        var J = 100,
            num = 0,
            getNow = function () {
                return new Date().getTime();
            };
        (function () {
            var s = 50,
                fn = function (l) {
                    l = 1;
                    var now = getNow();
                    var c = 1;
                    while (c < J) {
                        if (now > D + c * s) {
                            l++;
                        }
                        c++;
                    }
                    D = getNow();
                    _this.setState({
                        cpu: l / J * 100 + "%",
                    })
                },
                t = setInterval(fn, 500),
                D = getNow();
            fn();
        })();
    }
    
  


    render() {
        const { monitorData} = this.props;
        const {cpu, userNum, adminNum ,defaultNum} = this.state;
        const param = paramServer.getParam()
        let name = '';
        return (
           <div className="footer claerfix">
                <div className="fl">
                        当前房间共有:
                        <b className="blue fw">{userNum}</b>
                        人
                        &nbsp; 
                        学生 <b className="blue fw">{defaultNum}</b>
                        人
                        &nbsp; 
                        老师 <b className="blue fw">{adminNum}</b>
                        人
                </div>
                {/* <div className="fr" style={{ marginLeft: '70px' }}>
                    <span>
                        <b>
                            CPU使用率: {cpu}
                        </b>
                    </span>
                </div> */}
                <div className="fr">
                    {monitorData &&
                        <span>
                            <b>
                                {
                                    `掉帧: ${monitorData.video.lostpre ? (monitorData.video.lostpre * 100).toFixed(2) : 0}% 
                                    ${monitorData.video.br ? monitorData.video.br : 0}kb/s`
                                }
                            </b>
                        </span>
                    }
                    {
                        param && param.roomId && <Clipboard roomId={param.roomId}/>
                    }
                </div>
           </div>
        );
    }
}

export default Footer;
