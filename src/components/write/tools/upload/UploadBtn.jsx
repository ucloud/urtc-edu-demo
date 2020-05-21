/* eslint-disable */ 
// @ts-nocheck
import * as React from "react";
import { Popover, Progress, Tooltip } from '@ucloud-fe/react-components';
import * as OSS from "ali-oss";
import Upload from 'rc-upload';
import {PptKind, WhiteWebSdk} from "white-react-sdk";
import { PPTProgressPhase } from "./UploadManager";

import {UploadManager} from "./UploadManager";

import "./UploadBtn.scss";
import image from "@/src/assets/images/pic.png";
import doc_to_image from "@/src/assets/images/ppt2s.png";
// import * as upload from "../images/image.svg";

export const FileUploadStatic = "application/pdf, " +
    "application/vnd.openxmlformats-officedocument.presentationml.presentation, " +
    "application/vnd.ms-powerpoint, " +
    "application/msword, " +
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default class UploadBtn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: false,
            isUploading: false,
            ossPercent: 0,
            converterPercent: 0,
        };
        this.client = new OSS({
            accessKeyId: props.oss.accessKeyId,
            accessKeySecret: props.oss.accessKeySecret,
            region: props.oss.region,
            bucket: props.oss.bucket,
        });
    }

    onProgress = (phase, percent) => {
        switch (phase) {
          case PPTProgressPhase.Uploading:
            this.setState({ ossPercent: Math.round(percent * 100) });
            break;
          case PPTProgressPhase.Converting:
            this.setState({ converterPercent: Math.round(percent * 100) });
            break;
          default:
            this.setState({
                ossPercent: 0,
                converterPercent: 0
            });
        }
    };

    uploadStatic = (event) => {
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk({ preloadDynamicPPT: true });
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken);
        this.setState({
            isUploading: true,
        });
        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Static,
            this.onProgress)
        .then(() => {
            this.setState({
                isUploading: false,
                ossPercent: 0,
                converterPercent: 0,
            });
        })
        .catch(error => {
            alert("上传失败：" + error);
            this.setState({
                isUploading: false,
                ossPercent: 0,
                converterPercent: 0,
            });
        });
    }

    uploadDynamic = (event) => {
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk({ preloadDynamicPPT: true });
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken);
        this.setState({
            isUploading: true,
        });
        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Dynamic,
            this.onProgress)
        .then(() => {
            this.setState({
                isUploading: false,
                ossPercent: 0,
                converterPercent: 0
            });
        })
        .catch(error => {
            alert("上传失败：" + error);
            this.setState({
                isUploading: false,
                ossPercent: 0,
                converterPercent: 0
            });
        });
    }

    uploadImage = (event) => {
        const uploadFileArray = [];
        uploadFileArray.push(event.file);
        const uploadManager = new UploadManager(this.client, this.props.room);
        let clientWidth;
        let clientHeight;
        if (this.props.whiteboardRef) {
            clientWidth = this.props.whiteboardRef.clientWidth;
            clientHeight = this.props.whiteboardRef.clientHeight;
        } else {
            clientWidth = window.innerWidth;
            clientHeight = window.innerHeight;
        }
        this.setState({
            isUploading: true,
        });
        uploadManager
            .uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.onProgress)
            .then(() => {
                this.setState({
                    isUploading: false,
                    ossPercent: 0,
                    converterPercent: 0
                });
            })
            .catch(error => {
                alert("上传失败：" + error);
                this.setState({
                    isUploading: false,
                    ossPercent: 0,
                    converterPercent: 0
                });
            });
    }

    renderPopoverContent = () => {
        return <div className="popover-box">
            <Upload
                style={{display:'inline-block'}}
                disabled={!this.props.roomToken}
                accept={FileUploadStatic}
                showUploadList={false}
                customRequest={this.uploadStatic}>
                <div className="popover-box-cell">
                    <div className="popover-box-cell-img-box">
                        <img src={doc_to_image} style={{height: '28px'}}/>
                    </div>
                    <div className="popover-box-cell-title">
                        资料转图片
                    </div>
                    <div className="popover-box-cell-script">支持 pdf、ppt、pptx、word</div>
                </div>
            </Upload>
            {/*
            <Upload
                style={{display:'inline-block'}}
                disabled={!this.props.roomToken}
                accept={"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
                showUploadList={false}
                customRequest={this.uploadDynamic}>
                <div className="popover-box-cell">
                    <div className="popover-box-cell-img-box">
                        <img src={doc_to_web} style={{height: '28px'}}/>
                    </div>
                    <div className="popover-box-cell-title">
                        资料转网页
                    </div>
                    <div className="popover-box-cell-script">支持 pptx</div>
                </div>
            </Upload>
            */}
            <Upload
                style={{display:'inline-block'}}
                accept={"image/*"}
                showUploadList={false}
                customRequest={this.uploadImage}>
                <div className="popover-box-cell">
                    <div className="popover-box-cell-img-box">
                        <img src={image} style={{height: '28px'}}/>
                    </div>
                    <div className="popover-box-cell-title">
                        上传图片
                    </div>
                    <div className="popover-box-cell-script">支持常见图片格式</div>
                </div>
            </Upload>
        </div>;
    }

    render() {
        const { active, isUploading, ossPercent, converterPercent } = this.state;
        let content = null;
        if (converterPercent > 0) {
            content = (
                <Tooltip popup={<p>转换中...</p>}>
                    <div className="upload-progress flie-upload fl">
                        <Progress percent={converterPercent}/>
                    </div>
                </Tooltip>
            );
        } else if (ossPercent > 0) {
            content = (
                <Tooltip popup={<p>上传中...</p>}>
                    <div className="upload-progress file-convert fl">
                        <Progress percent={ossPercent}/>
                    </div>
                </Tooltip>
            );
        } else {
            if (isUploading) {
                content = <div className="upload-start fl">上传准备中...</div>
            } else {
                content = (
                    <Popover popup={this.renderPopoverContent()} placement="right">
                        <div
                            onMouseEnter={() => this.setState({active: true})}
                            onMouseLeave={() => this.setState({active: false})}
                            className={`iconfont icon-folder-add fl ${active ? 'active': ''}`}>
                        </div>
                    </Popover>
                );
            }
        }
        return content;
    }
}
