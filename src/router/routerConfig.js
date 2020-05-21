// @ts-nocheck
/*
 * @Description: In User Settings Edit
 * @Author: 路由配置信息
 * @Date: 2019-09-03 14:57:06
 * @LastEditTime: 2019-09-12 14:34:15
 * @LastEditors: Please set LastEditors
 */
import Login from '../pages/login/index';
import Share from '../pages/share';
import ClassRoom from '../pages/class/index';
import StudentClass from '../pages/studentClass/index'
import LiveClass from '../pages/liveClass/index'

export const routerConfig = [{
    path: '/', 
    component: Login,
    auth: false, //是否开启鉴权
}, {
    path: '/share',
    component: Share,
    auth: false,
}, {
    path: '/class',
    component: ClassRoom,
    auth: true,
}, {
    path: '/liveroom',
    component: LiveClass,
    auth: true,
}, {
    path: '/student',
    component: StudentClass,
    auth: true,
},
{
    path: '/live',
    component: LiveClass,
    auth: true,
}
];