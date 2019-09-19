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
		uid: req.body.uid,
		password: req.body.password
	}
	let verifyData={
		verCode:       req.body.verCode
	}
	
	let accountCollection = informationDB.getCollection("user");
	accountCollection.findOne({uid: UserData.uid}, function (err, data) {
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
			   if(verfyData.verCode==randomRes){
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
		nickname:               req.body.nickname,
		phone:              req.body.phone,
		uid:                req.body.uid,
        major:              req.body.major,
		address:            req.body.address,
		password:           req.body.password
	}
	let verifyData={
		verCode:       req.body.verCode
	}

	let enrollmentCollection = informationDB.getCollection("user");
	enrollmentCollection.findOne({uid: submitData.uid}, function (err, data) {
		if(data){
			let randomRes = confMsgSend.sendMsg(submitData.phone);
	        console.log(randomRes);
	        res.status(200).json({
		    code	: 1,
		    confCode: randomRes
	});
	       if(verifyData.verCode==randomRes){
			
		   enrollmentCollection.save(subimitData)
            res.status(200).json({"code":1,"msg":"修改成功"});
		}
		   else{
			   res.status(200).json({"code":-1,"msg":"验证码错误，修改失败"})
		   }
	}

		else if (!data) {  
			enrollmentCollection.insert(submitData);  
			res.status(200).json({ "code": 1 ,"msg": "提交成功"});
		    }

		
		    else{   
			res.status(200).json({
				code : -1,
				msg : "fail"
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
		uid: req.body.uid,
		password: req.body.password
	}
	
	let accountCollection = informationDB.getCollection("user");
	accountCollection.findOne({uid: UserData.uid}, function (err, data) {
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


	
	accountCollection.findOne({checkCondition:UserData.value}, function (err, data) {
		if (data) {
			    accountCollection.save(UserData)
				res.status(200).json({ "code": 1 ,"msg": "密码修改成功"})
			
			
		}
		else{
            res.status(200).json({"code":-1,"msg":"密码修改失败"})

        }

	});
});







module.exports = router;

