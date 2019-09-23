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
router.post('forum/post',urlencodedParser,function(req,res,next){
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
router.post("forum/discuss",urlencodedParser,function(req,res,next){
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
router.post('forum/like',urlencodedParser,function(req,res,next){
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
/*
查看所有帖子
*/
router.get('forum/checkAllPost',urlencodedParser,function(req,res,next){
	var postCollection = informationDB.getCollection('post');
	postCollection.find().toArray(function(err,allData){
		if(err)
		{
			res.status(200).json({
				code: -1,
				msg	: "checkAllPost error"
			});
			return;
		}
		res.status(200).json({
			code: 1,
			data: allData
		});
		return;
	})
});

/*
打开单个帖子
*/
router.get('forum/openOnePost',urlencodedParser,function(req,res,next){
	var postCollection = informationDB.getCollection('post');
	postCollection.find({_id:objectID(req.body._id)}).toArray(function(err,allData){
		if(err)
		{
			res.status(200).json({
				code: -1,
				msg	: "openOnePost error"
			});
			return;
		}
		res.status(200).json({
			code: 1,
			data: allData
		});
		return;
	})
});


/*
查看个人所有帖子
*/
router.get('forum/checkPersonalPost',urlencodedParser,function(req,res,next){
	var postCollection = informationDB.getCollection('post');
	postCollection.find({_id:req.body._id}).toArray(function(err,allData){
		if(err)
		{
			res.status(200).json({
				code: -1,
				msg	: "checkPersonalPost error"
			});
			return;
		}
		res.status(200).json({
			code: 1,
			data: allData
		});
		return;
	})
});

/*
取消评论点赞
*/

router.post('forum/cancelLike',urlencodedParser,function(req,res,next){
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
		console.log("find like for comment success!");
		findResCom.like.deleteOne({_id:likeBody.liker},function(err,deleteResCom){
			if(err)
			{
				res.status(200).json({
					code: -1,
					msg	: "fail"
				});
				return;
			}
		})
		commentCollection.deleteOne({ _id : likeBody.commentID},{$set: {like : likeList}},function(err,updateResCom){
			
			console.log("delete like for comment success!");
			userCollection.findOne({_id : likeBody.liker},function(err,findResUser){
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
				console.log("finish!");
				return;
			})
		})
	})
});



//意见反馈

router.post('/Opinion/send', urlencodedParser, function (req, res, next) {

	let postmessage = {

        content: req.body.content,

        reply: [],

		tags: req.body.tags,

		color: req.body.color,

		size: req.body.size,

		index: req.body.index

	}



	console.log(req.body)

	postmessage.tags = JSON.parse(postmessage.tags)

	postmessage.tags = Array.from(new Set(postmessage.tags));



	console.log(postmessage)

	

    let opinionCollection = informationDB.getCollection("opinion");

    let opinionTagCollection = informationDB.getCollection("OpinionTag");



    opinionCollection.insert(postmessage);



	opinionCollection.findOne({}, function (err, data) {

		if (data) {

            for(x in postmessage.tags){

				(function(x){

					console.log(postmessage.tags[x])

					opinionTagCollection.findOne({tag: postmessage.tags[x]}, function (err, tagData) {

						if(tagData) {

							console.log(tagData)

							opinionCollection.findOne({index: postmessage.index}, function (err, data) {

								tagData.messages.push(data);

								opinionTagCollection.update({tag: postmessage.tags[x]}, {$set:{'messages': tagData.messages}})

							});

						}

						else{

							let tagItem = {

								tag: postmessage.tags[x],

								messages: []

							}

							opinionCollection.findOne({index: postmessage.index}, function (err, data) {

								tagItem.messages.push(data);

								opinionTagCollection.insert(tagItem);

							});

						}

					});

				}) (x);

            }

            res.status(200).json({ "code": "1" ,"msg": "提交成功"})

		}

		else{

			res.status(200).json({ "code": "-1" ,"msg": "提交失败"})

		}

		

    });



});



//意见反馈

router.post('/Opinion/Reply', urlencodedParser, function (req, res, next) {

	let replymessage = {

        content: req.body.content,

		index: req.body.index,

		name: req.body.name

	}



	console.log(req.body)

	

    let opinionCollection = informationDB.getCollection("opinion");



	opinionCollection.findOne({index: replymessage.index}, function (err, data) {

		if (data) {

			data.reply.push(replymessage)

            opinionCollection.update({index: replymessage.index}, {$set:{'reply': data.reply}})

            res.status(200).json({ "code": "1" ,"msg": "提交成功"})

        }

        else{

            res.status(200).json({ "code": "-1" ,"msg": "没有这条消息"})

        }

    });



});



//意见反馈

router.get('/Opinion', urlencodedParser, function (req, res, next) {



    let opinionCollection = informationDB.getCollection("opinion");



	opinionCollection.find().sort({"_id":-1}).toArray(function (err, allData) {

        res.status(200).json({data: allData})

	})



});



//意见反馈

router.get('/Opinion/getTags', urlencodedParser, function (req, res, next) {



    let opinionTagCollection = informationDB.getCollection("opinion");



	opinionTagCollection.find().toArray(function (err, allData) {

        res.status(200).json({data: allData})

	})



});



//意见反馈

router.get('/Opinion/getByTag', urlencodedParser, function (req, res, next) {



	let tag = req.query.tag;



	let opinionTagCollection = informationDB.getCollection("opinion");



	opinionTagCollection.find({tag: tag}).sort({"_id":-1}).toArray(function (err, allData) {

        res.status(200).json({data: allData})

	})



});




module.exports = router;

