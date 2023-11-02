/**
 * Created by way on 2016/12/6.
 */

import {Event} from '@wiajs/core';
import {format} from './util';

const def = {
  url: 'wss://wia.pub',
};

/* global
 *
 */
export default class Ws extends Event {
  static Status = {
    close: 0,
    open: 1,
    opened: 2,
  };

  static State = {
    offline: 0, // 未在线
    online: 1, // 上线
    idle: 2, // 空闲
    busy: 3, // 忙碌
    quiet: 4, // 免打扰
    hide: 5, // 隐身
    leave: 6, // 离开
  };

  static MsgSta = {
    sending: 0, // 未发送
    send: 1, // 已发送未读
    read: 2, // 已读
    delete: 3, // 删除到垃圾箱
    remove: 4, // 彻底删除
    store: 5, // 收藏
    top: 6, // 置顶
    star: 7, // 星标
  };

  status = 0;
  sta = 0; // 个人状态
  staInfo = '';
  workSta = 0;
  workInfo = '';
  tm = null; // 心跳定时器
  heartTm = 30; // 心跳时长，默认30秒一次，超过90秒，则认为离线
  ws = null; // websocket 实例

  /**
   * 构造函数，自动打开websocket
   * @param {*} opt 选项
   * {url:'ws/wss://wia.pub', pid:'xxx', time:10}
   * ims 服务器、连连号（类似QQ号）、心跳（默认30秒）
   * ws 服务器，自身pid，心跳时长多少秒
   */
  constructor(page, opt) {
    super(opt, [page]);
    this.page = page;
    opt = opt || {};
    this.opt = {...def, ...opt};
    this.status = Ws.Status.close;
    this.url = this.opt.url || `ws://${window.location.host}`;
    this.pid = this.opt.pid || '';
    this.heartTm = this.opt.time || this.heartTm;

    // 默认自动打开
    this.open();
  }

  open(cb) {
    if (!WebSocket) {
      alert('WebSocket not supported!');
      return null;
    }
    this.status = Ws.Status.open;

    // alert(location.host);
    const ws = new WebSocket(this.url); // `ws://${location.host}`
    this.ws = ws;
    if (ws) {
      ws.onopen = w => {
        this.status = Ws.Status.opened;
        this.sta = Ws.State.online;

        console.log('ws opened.');

        ws.send('Hello IMS!');

        if (this.onopen) this.onopen(w);

        if (cb) cb();

        // 启动心跳
        this.tm = setTimeout(() => {
          this.heart();
        }, 2000);
      };

      ws.onmessage = w => {
        // console.log(e);
        this.emit('local::msg', w.data);
      };

      ws.onclose = w => {
        // log('closed.');
        this.status = Ws.Status.close;
        if (this.onclose) this.onclose(w);
        this.ws = null;
      };

      ws.onerror = w => {
        // log('error!');
        if (this.onerror) this.onerror();
      };
    } else alert('连接消息服务器失败！');

    return ws;
  }

  send(s) {
    if (this.ws) {
      this.ws.send(s);
    } else {
      this.open(() => {
        if (this.ws) this.ws.send(s);
      });
    }
  }

  /**
 * 注册
 * @param {*} status 1: 注册 2：更新 0：取消注册 
 * @param {*} m 
    {
      name 名称（必选）
      mobile, 手机（必选）
      email, 邮箱
      pwd, 密码
      type, 类型
      status,状态
      nick, 昵称
      sex, 性别
      unitNo, 单位号
      rid, 合作方id
      from 来源
    };
 * 
 */
  reg(status, m) {
    const r = {R: status, ...m};
    const s = JSON.stringify(r);
    this.send(s);
  }

  /**
   * 状态与状态签名
   * 与心跳共用一个消息
   * @param {*} sta 个人状态
   * @param {*} sta 个人状态签名
   * @param {*} workSta 工作状态
   * @param {*} workSta 工作签名
   */
  state(sta, staInfo, workSta, workInfo) {
    this.sta = sta || this.sta;
    this.staInfo = staInfo || this.staInfo;
    this.workSta = workSta || this.workSta;
    this.workInfo = workInfo || this.workInfo;

    let msg = `[[${sta},"${staInfo}"]]`;
    if (workSta || workInfo) msg = `[[${sta},"${staInfo}"],[${workSta},"${workInfo}"]]`;
    msg = format('{"H":%s, "F":"%s"}', msg, this.pid);
    this.send(msg);
    this.tm = setTimeout(() => {
      this.heart();
    }, this.heartTm * 1000);
  }

  /**
   * 心跳，如果没有打开ws，重新打开
   */
  heart() {
    if (!this.pid || !this.status === Ws.Status.opened) {
      if (this.tm) clearTimeout(this.tm);
      return;
    }

    // 连接成功，则发送心跳
    let msg = `[[${this.sta},"${this.staInfo}"]]`;
    msg = format('{"H":%s,"F":"%s"}', msg, this.pid);
    this.send(msg);
    this.tm = setTimeout(() => {
      this.heart();
    }, this.heartTm * 1000);
  }

  /**
   * 订阅
   * @param {*} to 目的PID
   * @param {*} status 1：订阅；0：取消订阅
   */
  sub(to, status) {
    const msg = format('{"S":%d, "F":"%s", "T":"%s"}', status, this.pid, to);
    this.send(msg);
  }

  /**
   * 发送消息
   * @param {*} to 目的PID
   * @param {*} s 内容
   * @param {*} fw 转发PID，可选
   * @param {*} tp 话题，可选
   * @param {*} sq 序号，用于标记系列敏感消息
   * @param {*} st 状态 0 发送中 1 已发送未读 2 已读 3 删除到垃圾箱 4 彻底删除 5 收藏 6 置顶 7 星标
   */
  msg(to, s, fw, tp, sq, st) {
    let msg = s || '';
    msg = msg.replace(/([^\\])"/g, '$1\\"'); // /(?<!\\)"/g 不支持
    const tm = parseInt(new Date().getTime() - Date.parse('2000/01/01'), 10);
    msg = format(
      '{"M":"%s", "F":"%s", "T":"%s", "FW":"%s", "TP":"%s", "TM":%d, "SQ":%d, "ST":%d}',
      msg,
      this.pid,
      to,
      fw || '',
      tp || '',
      tm,
      sq || '',
      st || ''
    );
    this.send(msg);
  }

  // 群发
  group(t, s, fw, tp, sq, st) {
    let msg = s;
    msg = msg.replace(/([^\\])"/g, '$1\\"'); // /(?<!\\)"/g 不支持
    const tm = parseInt(new Date().getTime() - Date.parse('2000/01/01'), 10);
    msg = format(
      '{"M.G":"%s", "F":"%s", "T":"%s", "FW":"%s", "TP":"%s", "TM":%d, "SQ":%d, "ST":%d}',
      msg,
      this.pid,
      t,
      fw || '',
      tp || '',
      tm,
      sq || '',
      st || ''
    );
    this.send(msg);
  }

  /**
   * 发送信息，消息类别为I，不是M
   * @param {*} t 目的PID
   * @param {*} s 内容
   */
  info(t, s) {
    let msg = s;
    msg = msg.replace(/([^\\])"/g, '$1\\"'); // /(?<!\\)"/g 不支持
    msg = format('{"I":"%s", "F":"%s", "T":"%s"}', msg, this.pid, t);
    this.send(msg);
  }

  /**
   * 抢答，广播消息，座席抢答
   * @param {*} t
   * @param {*} s 消息
   */
  answer(t, s) {
    let msg = s;
    msg = msg.replace(/([^\\])"/g, '$1\\"'); // /(?<!\\)"/g 不支持
    msg = format('{"M.A":"%s", "F":"%s", "T":"%s"}', msg, this.pid, t);
    this.send(msg);
  }

  /**
   * 标签广播
   * @param {*} t 目标用户标签
   * @param {*} s 内容
   */
  tag(t, s) {
    let msg = s;
    msg = msg.replace(/([^\\])"/g, '$1\\"'); // /(?<!\\)"/g 不支持
    msg = format('{"M.T":"%s", "F":"%s", "T":"%s"}', msg, this.pid, t);
    this.send(msg);
  }

  // 关闭
  close() {
    if (this.tm) clearTimeout(this.tm);

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  closeTest() {
    this.ws.close();
  }
}
