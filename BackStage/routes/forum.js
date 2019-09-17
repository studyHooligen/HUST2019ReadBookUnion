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
发帖
*/
router.post('/post',urlencodedParser,function(req,res,next){
	var userCollection = informationDB.getCollection("user");
	var postCollection = informationDB.getCollection("post");
	var now = new Date();
	var postData={
		title       : req.body.title,
		book        : req.body.book,
		content     : req.body.content,
		creator     : req.body.creator,
		like		: [],
		comments	: [],
		date		: { month : now.getMonth()+1 , day : now.getDay()+1 }
	};
	console.log(postData);
	postCollection.insertOne(postData);
	var postMan = userCollection.findOne({ userName : postData.creator });
	var postHis = toArray(postMan.post).push(postData._id);
	userCollection.updateOne({_id : postData._id},{$set : { post : postHis}},function(err,res){
		if(err)
		{
			res.status(200).json({
				code	: -1,
				msg		: "sorry"
			});
			return;
		}
		else{

			res.status(200).json({
				code	: 1,
				msg		: "success"
			});
		}
	});

});

module.exports = router;

