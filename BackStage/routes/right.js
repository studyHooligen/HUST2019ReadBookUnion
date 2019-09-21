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



    let opinionCollection = informationDB.getCollection("pageViewer","PsychologyBoard");



	opinionCollection.find().sort({"_id":-1}).toArray(function (err, allData) {

        res.status(200).json({data: allData})

	})



});



//心理宣泄版

router.get('/Opinion/getTags', urlencodedParser, function (req, res, next) {



    let opinionTagCollection = informationDB.getCollection("pageViewer","PsychologyBoardTag");



	opinionTagCollection.find().toArray(function (err, allData) {

        res.status(200).json({data: allData})

	})



});



//心理宣泄版

router.get('/Opinion/getByTag', urlencodedParser, function (req, res, next) {



	let tag = req.query.tag;



	let opinionTagCollection = informationDB.getCollection("pageViewer","PsychologyBoardTag");



	opinionTagCollection.find({tag: tag}).sort({"_id":-1}).toArray(function (err, allData) {

        res.status(200).json({data: allData})

	})



});


module.exports = router;