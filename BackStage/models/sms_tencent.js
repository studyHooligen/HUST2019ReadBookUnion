'use strict';

let ConfigSet = require('../configs/config_set.json');
var QcloudSms = require("../node_modules/qcloudsms_js");  //短信发送模块

var appid = ConfigSet.APPID_SMS;  // SDK AppID 以1400开头

var appkey = ConfigSet.APPKEY_SMS; // 短信应用 SDK AppKey

var phoneNumbers = ["18850124510","17364065013"]; // 需要发送短信的手机号码

// 短信模板 ID，需要在短信控制台中申请
var templateId = 423143;  // NOTE: 这里的模板ID`7839`只是示例，真实的模板 ID 需要在短信控制台中申请

var smsSign = "HUSTEIC";  // NOTE: 签名参数使用的是`签名内容`，而不是`签名ID`。这里的签名"腾讯云"只是示例，真实的签名需要在短信控制台申请

var qcloudsms = QcloudSms(appid, appkey);  // 实例化 QcloudSms

var ssender = qcloudsms.SmsSingleSender();  //实例化 当个短信发送

function callBackFunction(err,res,resData){
    if (err) {
        console.log("err: ", err);
    } else {
        console.log("request data: ", res.req);
        console.log("response data: ", resData);
    }
}

// ssender.sendWithParam("86", phoneNumbers[0], templateId,params, smsSign, "", "", callback); 

exports.sendMsg = function(userPhone){
    let randomCode = [Math.ceil(Math.random()*10000)];     // 获取从 1 到 10000 的随机整数，取 0 的概率极小

    ssender.sendWithParam("86",userPhone,templateId,randomCode,smsSign,"","",callBackFunction);
    return randomCode;
}
