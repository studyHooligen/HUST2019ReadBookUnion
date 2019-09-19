var COS = require('../node_modules/cos-nodejs-sdk-v5');
let ConfigSet = require('../configs/config_set.json');
let BucketAddr = ConfigSet.COS_BUCKET;
let BucketPlace = ConfigSet.PLACE_BUCKET;

var cos = new COS({
    SecretId: ConfigSet.FWSC_ID,
    SecretKey: ConfigSet.FWSC_KEY
});

//上传
// cos.putObject({
//     Bucket: BucketAddr, 
//     Region: BucketPlace, 
//     Key: 'picture.jpg',              /* 必须 */
//     StorageClass: 'STANDARD',
//     Body: fs.createReadStream('./picture.jpg'), // 上传文件对象
//     onProgress: function(progressData) {
//         console.log(JSON.stringify(progressData));
//     }
// }, function(err, data) {
//     console.log(err || data);
// });   
//具体看腾讯官方文档（https://cloud.tencent.com/document/product/436/36119#.E7.AE.80.E5.8D.95.E4.B8.8A.E4.BC.A0.E5.AF.B9.E8.B1.A1）