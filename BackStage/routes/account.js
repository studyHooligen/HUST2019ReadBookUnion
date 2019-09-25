let express = require('express');
let informationDB = require('../models/information_db');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
var ObjectID = require('mongodb').ObjectID;
var confMsgSend = require('../models/sms_tencent');

// 跨域header设定
router.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1')
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});

//短信发送demo
router.post('/sendM',urlencodedParser,function(req,res,next){
	randomRes = confMsgSend.sendMsg('18850124510');
	console.log(randomRes);
	res.status(200).json({
		code	: 1,
		confCode: randomRes
	});
})

/*
 * @function 用户登录
 * @param account(string) 账户, password(string) 密码
 * @return code(int) , msg(string)
 */
router.post('/login', urlencodedParser, function (req, res, next) {
	let UserData = {
		phone: req.body.phone,
		password: req.body.password,
		nickphone:req.body.nickname
	}
	let verifyData={
		verCode:       req.body.verCode
	}
	
	let accountCollection = informationDB.getCollection("user");
	accountCollection.findOne({phone: UserData.phone}, function (err, data) {
		if (data) {
			if (UserData.password == data.password){
				res.status(200).json({ "code": 1 ,"msg": "登陆成功"})
			}
			else {
                let randomRes = confMsgSend.sendMsg(submitData.phone);
	           console.log(randomRes);
	           res.status(200).json({
		        code	: 1,
		       confCode: randomRes
			   });
			   if(verifyData.verCode==randomRes){
				res.status(200).json({ "code": 1 ,"msg": "登陆成功"})
			   }
			   else {
				   res.status(200).json({"code":-1,"msg":"登陆失败"})
			   }
			}
		}
		else{
            res.status(200).json({"code":-1,"msg":"你还未注册"})

        }

	});
});

/*
 * @function 新用户注册/修改
 * @param nickname(string)昵称，phone(string)电话,uid(string)学号,
 * major(string)院系，address(string)住址,password(string)密码
 * @return code(int) , msg(string)
 */
router.post('/register', urlencodedParser, function (req, res, next) {
	
	let submitData = {
		nickname:           req.body.nickname,
		phone:              req.body.phone,
		uid:                req.body.uid,
        major:              req.body.major,
		address:            req.body.address,
		password:           req.body.password
	}
	let randomRes = confMsgSend.sendMsg(submitData.phone);
	        console.log(randomRes);
	        res.status(200).json({
		    code	: 1,
		    confCode: randomRes
	});
	
	
	let verifyData={
		verCode:       req.body.verCode
	}

	let enrollmentCollection = informationDB.getCollection("user");
	enrollmentCollection.findOne({uid: submitData.uid}, function (err, data) {
		if(data){
	       if(verifyData.verCode==randomRes){
			
		   enrollmentCollection.save(subimitData)
            res.status(200).json({"code":1,"msg":"修改成功"});
		   }
		   else{
			   res.status(200).json({"code":-1,"msg":"验证码错误，修改失败"});
		   }
		}
	
        
           if (!data) {  
			   if(verifyData.verCode==randomRes){
			enrollmentCollection.insert(submitData);  
			res.status(200).json({ "code": 1 ,"msg": "注册成功"});
		    }
		
		
		    else{   
			res.status(200).json({
				code : -1,
				msg : "注册失败"
			})
		}
	}
            else{
				res.status(200).json({
					code : -1,
					msg  : "失败"
				})
			}


	});
});



/*
 * @function 管理员登录
 * @param account(string) 账户, password(string) 密码
 * @return code(int) , msg(string)
 */
router.post('/admin/login', urlencodedParser, function (req, res, next) {
	let UserData = {
		phone: req.body.phone,
		password: req.body.password
	}
	
	let adminCollection = informationDB.getCollection("admin");
	adminCollection.findOne({phone: UserData.phone}, function (err, data) {
		if (data) {
			if (UserData.password == data.password){
				res.status(200).json({ "code": 1 ,"msg": "登陆成功"})
			}
			else {
				res.status(200).json({ "code": -1 ,"msg": "密码错误"})
			}
		}
		else{
            res.status(200).json({"code":-1,"msg":"你不是管理员"})

        }

	});
});




/*
 * @function 管理员修改密码
 * @param account(string) 账户, password(string) 密码
 * @return code(int) , msg(string)
 */
router.post('/admin/changeUserPassword', urlencodedParser, function (req, res, next) {
	let UserData = {
		key:        req.body.key,
		value:      req.body.value,
		newPassword:req.body.newPassword
	}
	
	let accountCollection = informationDB.getCollection("user");

	checkCondition=UserData.key


	

		accountCollection.updateOne({key : UserData.value},{$set : {password : UserData.newpassword}},function(err,updateRes){
			if(err)
			{
				res.status(200).json({
					code: -1,
					msg	: "fail"
				});
				return;
			}
			res.status(200).json({
				code: 1,
				msg	: "success"
			});
			return;
		})
	});

/*
 * @function 用户密码找回
 * @param account(string) 账户, password(string) 新密码
 * @return code(int) , msg(string)
 */
router.post('/admin/PasswordReset', urlencodedParser, function (req, res, next) {
	let UserData = {
		phone:        req.body.phone,
		verCode:      req.body.verCode,
		newPassword:  req.body.newPassword
	}
	
	let accountCollection = informationDB.getCollection("user");

	let randomRes = confMsgSend.sendMsg(UserData.phone);
	        console.log(randomRes);
	        res.status(200).json({
		    code	: 1,
			confCode: randomRes
			})

    if(verCode==randomRes)
	{
	accountCollection.updateOne({phone : UserData.phone},{$set : {password : UserData.newPassword}}, function (err, data) {
		if(err)
			{
				res.status(200).json({
					code: -1,
					msg	: "fail"
				});
				return;
			}
			res.status(200).json({
				code: 1,
				msg	: "success"
			});
			return;
		

	});
	}
	else
	{
		res.status(200).json({
			code   :-1,
			msg    :"fail"
		});
		return;
	}
});






module.exports = router;

