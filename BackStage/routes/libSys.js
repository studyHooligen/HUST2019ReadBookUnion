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
 * @function 借书
 * @param
 * @return code(int) , msg(string)
 */
router.post('/forum/borrowBook',urlencodedParser,function(req,res,next){
	//假设前端已完成登录
	BookCollection=informationDB.getCollection('BOOKS');
	UserCollection=informationDB.getCollection('ACCOUNT');
	BorrowCollection=informationDB.getCollection('BORROW');

	BookCollection.findOne({bid : req.body.bookID},function(err,bookSituation){
		if(err) console.log("ERROR:" + err);
		else{
			//console.log(bookSituation)  //测试打开
			if(!bookSituation) {res.status(200).json({ code : -1 , msg : "书籍不在架上"}); return;}
			else if(!bookSituation.availNum) res.status(200).json({code : -1, msg : "书籍已借光"});
				else {
					UserCollection.findOne({uid : req.body.uid},function(err,userD){
						//console.log(userD);  //测试打开
						if(userD.borrowing.length>=2) res.status(200).json({code : -1, msg :"没有权限借书"});
						else{
							let nowDate= new Date();

							BorrowCollection.insertOne({  //书籍借用情况中加一条记录
								book : {
									bookID : bookSituation.bid,
									book : bookSituation.book
								},
								borrower : {
									uid : userD.uid
								},
								borrowTime : {
									year : nowDate.getFullYear(),
									month : nowDate.getMonth(),
									day : nowDate.getDay()
								},
								returnTime:{
									year : 0,
									month : 0,
									day : 0
								},
								place : "",
								continueTime : 0
							},function(err,insertD){
								//console.log(insertD.ops[0]);  //测试打开
								//书籍可借用量-1
								BookCollection.updateOne({bid : req.body.bookID} ,
									{'$set' : {'availNum' : bookSituation.availNum-1} });
								
								//用户记录更新
								UserCollection.updateOne({uid : req.body.uid},
									{'$set' : {borrowing : Array(userD.borrowing).push(insertD.ops[0]._id)}});
	
								res.status(200).json({
									"code" : 1,
									'msg' : '操作成功'
								})
							});
							

							
						}
					})
				}
		}
	});
});

/*
 * @function 还书
 * @param
 * @return code(int) , msg(string)
 */
router.post('/forum/returnBook',urlencodedParser,function(req,res,next){
	BookCollection=informationDB.getCollection('BOOKS');
	UserCollection=informationDB.getCollection('ACCOUNT');
	BorrowCollection=informationDB.getCollection('BORROW');
	HistoryCollecion=informationDB.getCollection('HISTORY');

	BorrowCollection.findOne({'_id' : ObjectID(req.body._id)},function(err,borrowingData){
		if(!borrowingData) {res.status(200).json({ 'code' : -1 , 'msg' : '错误'}); return;}
		BorrowCollection.updateOne({'_id' : ObjectID(req.body._id)},
			{'$set' : {
				'place' : req.body.place,
				'returnTime' : JSON.parse(req.body.time)
			} });
		res.status(200).json({'code' : 1, 'msg' : '预约归还成功'});
	});
})

/*
 * @function 删除图书（管理员权限）
 * @param
 * @return code(int) , msg(string)
 */
router.get('/admin/deleteBook',urlencodedParser,function(req,res,next){

	BookCollection=informationDB.getCollection('BOOK');

	BookCollection.delete({'_id' : ObjectID(req.body._id)},function(err,next){
		if(!_id) res.status(200).json({'code' : 1, 'msg' : "删除成功"});
		else
         {
			res.status(200).json({
				'code' : -1,
				'msg' : "删除失败（没有这本书）"
			})
		}
	})
})



module.exports = router;

