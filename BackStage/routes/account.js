let express = require('express');
let informationDB = require('../models/information_db');
let router = express.Router();
let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
var ObjectID = require('mongodb').ObjectID;

// 跨域header设定
router.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1')
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});


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
	
	let accountCollection = informationDB.getCollection("user");
	accountCollection.findOne({account: UserData.account}, function (err, data) {
		if (data) {
			if (UserData.password == data.password){
				res.status(200).json({ "code": 1 ,"msg": "登陆成功"})
			}
			else {
				res.status(200).json({ "code": -1 ,"msg": "密码错误"})
			}
		}
		else{
            res.status(200).json({"code":-1,"msg":"你还未注册"})

        }

	});
});

/*
 * @function 新用户注册
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
	
	let enrollmentCollection = informationDB.getCollection("user");
	enrollmentCollection.findOne({uid: submitData.uid}, function (err, data) {
		if (data) {
			enrollmentCollection.insert(submitData);
			res.status(200).json({ "code": 1 ,"msg": "提交成功"});
		}

	});
});




module.exports = router;

