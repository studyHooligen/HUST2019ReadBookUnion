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
	userCollection.findOne({ userName : postData.creator },function(err,postMan){
		if(err)
		{
			console.log("/forum/post error!");
			res.status(200).json({
				code: -2,
				msg	: "error User!"
			});
			return;
		}
		// console.log(typeof postMan.post);
		arrData = postMan.post;
		// postMan.post.toArray(function(err,arrData){
			arrData.push(postData._id);
			userCollection.updateOne({userName : postData.creator},{$set : { post : arrData}},function(err,updateRes){
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
					return;
				}
			});
		// });
	

	});
});

/*
评论帖子
*/
router.post("/discuss",urlencodedParser,function(req,res,next){
	var postCollection = informationDB.getCollection("post");
	var commentCollection = informationDB.getCollection("comment");
	var discussBody = {
		father		: req.body.postID,
		commentator	: req.body.discussor,
		content		: req.body.content,
		like 		: []
	};
	console.log(discussBody);
	commentCollection.insertOne(discussBody);
	postCollection.findOne({_id : ObjectID(discussBody.father) },function(err, findRes){
		if(!findRes || err)
		{
			res.status(200).json({
				code: -1,
				msg	: "fail"
			});
			return;
		}
		console.log(findRes);
		var comments = findRes.comments;
		comments.push(discussBody._id);
		postCollection.updateOne({_id : discussBody.father},{$set : {comment : comments}},function(err,updateRes){
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
	})
});

/*
点赞评论
*/
router.post('/like',urlencodedParser,function(req,res,next){
	var commentCollection = informationDB.getCollection('comment');
	var userCollection = informationDB.getCollection('user');

	var likeBody = {
		commentID	: ObjectID(req.body.commentID),
		liker		: req.body.liker
	};

	commentCollection.findOne({ _id : likeBody.commentID},function(err,findResCom){
		if(err)
			{
				res.status(200).json({
					code: -1,
					msg	: "fail"
				});
				return;
			}
		console.log("find comment success!");
		var likeList = findResCom.like.push(likeBody.liker);
		commentCollection.updateOne({ _id : likeBody.commentID},{$set: {like : likeList}},function(err,updateResCom){
			if(err)
			{
				res.status(200).json({
					code: -1,
					msg	: "fail"
				});
				return;
			}
			console.log("update comment success!");
			userCollection.findOne({_id : likeBody.liker},function(err,findResUser){
				if(err)
				{
					res.status(200).json({
						code: -1,
						msg	: "fail"
					});
					return;
				}
				console.log("find User success!");
				var likeList = findResUser.like.push(likeBody.commentID);
				userCollection.updateOne({_id : likeBody.liker},{$set : {like : likeList}},function(err,updateResUser){
					if(err)
					{
						res.status(200).json({
							code: -1,
							msg	: "fail"
						});
						return;
					}
					console.log("update User success!");
					res.status(200).json({
						code: 1,
						msg	: "success"
					});
					console.log("finish!");
					return;
				})
			})
		})
	});
})

module.exports = router;

