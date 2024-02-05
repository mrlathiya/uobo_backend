const AWS = require('aws-sdk');
var s3 = new AWS.S3();
const fs = require('fs');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_SDK_LOAD_CONFIG: 1
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4'
});

/* Delete Image */
const _delete = async (address) => {
  try {
    var params = {
      Bucket: process.env.BUCKET_NAME,
      Key: address
    };

    return new Promise((resolve, reject) => {
      s3.deleteObject(params, function (err, rese) {
        if (err) {
          resolve({
            status: 0,
            err: err
          });
        } else {
          resolve({
            status: 1,
            URL: `${process.env.AWS_S3_URL}${address}`
          });
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

/* Upload Image on s3 bucket */
const _upload = async (file,folderName, fileNameIs) => {
  try {
    let fileName = fileNameIs !== undefined ? fileNameIs : new Date().getTime().toString();

    let base64ContentArray = file.split(",");     
    
    let mimeType = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0];

    let ImageToStore = base64ContentArray[1];

    ImageToStore = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    let extension = mimeType.split('/')[1];

    return new Promise((resolve, reject) => {
      console.log("S3 upload...!!!")
        
      if(folderName == undefined || folderName == ""){
        folderName = 'imgs'
      }
      
      var profile = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${folderName}/${fileName}.${extension}`,
        ACL: 'public-read',
        Body: ImageToStore,
        ContentType: 'image/*',
        ContentEncoding: 'base64'
      };
    
      s3.putObject(profile, function (err, rese) {
        if (err) {
          resolve({
            status: 0,
            err: err
          });
    
        } else {
          resolve({
            status: 1,
            URL: `${process.env.AWS_S3_URL}${folderName}/${fileName}.${extension}`,
            address: `${folderName}/${fileName}.${extension}`,
            name: `${fileName}.${extension}`
          });

        }
      });
    })
  } catch (error) {
    console.log(error);
    return error;
  }
};

/* Upload PDF on s3 bucket */
const uploadPDF = async (file, fileName, folderName) => {

  if (fs.existsSync(file)) {

    return new Promise((resolve, reject) => {
        
      if(folderName == undefined || folderName == ""){
        folderName = 'estimations'
      }
      
      var profile = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${folderName}/${fileName}`,
        ACL: 'public-read',
        Body: fs.createReadStream(file),
      };
    
      s3.putObject(profile, function (err, rese) {
        if (err) {
    
          resolve({
            status: 0,
            err: err
          });
    
        } else {
          fs.unlinkSync(file);
          resolve({
            status: 1,
            URL: `${process.env.AWS_S3_URL}${folderName}/${fileName}`,
            address: `${folderName}/${fileName}`,
            name: `${fileName}`
          });
  
        }
      });
    })
  }
}

module.exports = {
  _upload,
  _delete,
  uploadPDF
};