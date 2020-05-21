/*
 * @Description: 
 * @Author: leif.zhang
 * @Date: 2019-09-19 11:15:12
 * @LastEditTime: 2019-09-19 13:53:07
 * @LastEditors: Please set LastEditors
 * 发布订阅模式(观察者模式) *
     handles: 事件处理函数集合 *
     on: 订阅事件 *
     emit: 发布事件 *
     off: 删除事件
 */
class PubSub {
    constructor() {
        this.handles = {};
    }

    // 订阅事件
    on(eventType, handle) {
        if (!this.handles.hasOwnProperty(eventType)) {
            this.handles[eventType] = [];
        }
        if (typeof handle == 'function') {
            this.handles[eventType].push(handle);
        } else {
            throw new Error('缺少回调函数');
        }
        return this;
    }

    // 发布事件
    emit(eventType, ...args) {
        if (this.handles.hasOwnProperty(eventType)) {
            this.handles[eventType].forEach((item, key, arr) => {
                item.apply(null, args);
            })
        } else {
            throw new Error(`"${eventType}"事件未注册`);
        }
        return this;
    }

    // 删除事件
    off(eventType, handle) {
        if (!this.handles.hasOwnProperty(eventType)) {
            throw new Error(`"${eventType}"事件未注册`);
        } else if (typeof handle != 'function') {
            throw new Error('缺少回调函数');
        } else {
            this.handles[eventType].forEach((item, key, arr) => {
                if (item == handle) {
                    arr.splice(key, 1);
                }
            })
        }
        return this; // 实现链式操作
    }
}

export {PubSub};