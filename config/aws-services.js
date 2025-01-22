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
const _upload = async (file, folderName, fileType, fileNameIs) => {
  try {
    let fileName = fileNameIs !== undefined 
    ? fileNameIs.replace(/\s+/g, "_") // Replace spaces with underscores
    : new Date().getTime().toString();

    let base64ContentArray = file.split(",");
    
    let mimeType;
    if (fileType === "csv") {
      mimeType = "text/csv";
    } else if (fileType === "image") {
      mimeType = base64ContentArray[0].match(/[^:\s*]\w+\/[\w-+\d.]+(?=[;| ])/)[0];
    } else {
      throw new Error("Unsupported file type");
    }

    let fileToStore = Buffer.from(base64ContentArray[1], 'base64');

    return new Promise((resolve, reject) => {
      console.log("S3 upload...!!!")
        
      if (folderName == undefined || folderName == "") {
        folderName = 'files';
      }
      
      var profile = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${folderName}/${fileName}.${fileType}`,
        ACL: 'public-read',
        Body: fileToStore,
        ContentType: mimeType,
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
            URL: `${process.env.AWS_S3_URL}${folderName}/${fileName}.${fileType}`,
            address: `${folderName}/${fileName}.${fileType}`,
            name: `${fileName}.${fileType}`
          });
        }
      });
    })
  } catch (error) {
    console.log(error);
    return error;
  }
};

const listOfDocuments = async (files, folderName) => {
  try {
    const results = [];

    // Iterate over each file in the array
    for (const file of files) {
      let documentIs = file.file;
      let fileName = file.fileName !== undefined ? file.fileName : new Date().getTime().toString();

      // let base64ContentArray = documentIs.split(",");
      // let base64ContentArray = documentIs;

      let base64Content;
      if (documentIs.includes(',')) {
        base64Content = documentIs.split(',')[1]; // Split and get the base64 string
      } else {
        base64Content = documentIs; // Already a base64 string
      }

      // console.log(file.type);
      
      let mimeType;
      if (file.type === "csv") {
        mimeType = "text/csv";
      } else if (file.type === "image" || file.type === "jpeg" || file.type === "jpg" || file.type === "png") {
        mimeType = 'image/jpeg';
      } else if (file.type === "pdf") {
        mimeType = "application/pdf";
      } else if (file.type === "doc") {
        mimeType = "application/msword";
      } else {
        mimeType = 'application/octet-stream';
      }

      let fileToStore = Buffer.from(base64Content, 'base64');

      // Create a promise for each file upload
      const uploadPromise = new Promise((resolve, reject) => {
        console.log("S3 upload...!!!")
          
        if (folderName == undefined || folderName == "") {
          folderName = 'customer_documents';
        }
        
        var profile = {
          Bucket: process.env.BUCKET_NAME,
          Key: `${folderName}/${fileName}.${file.type}`,
          ACL: 'public-read',
          Body: fileToStore,
          ContentType: mimeType,
          ContentEncoding: 'base64'
        };
      
        s3.putObject(profile, function (err, rese) {
          if (err) {
            console.log('--------------ERROR---------------', err);
            resolve({
              status: 0,
              err: err
            });
          } else {
            console.log('--------------Solve---------------', `${process.env.AWS_S3_URL}${folderName}/${fileName}.${file.type}`);
            resolve({
              status: 1,
              URL: `${process.env.AWS_S3_URL}${folderName}/${fileName}.${ file.type}`,
              address: `${folderName}/${fileName}.${file.type}`,
              name: `${fileName}.${file.type}`,
              category: file.category,
              file: `${process.env.AWS_S3_URL}${folderName}/${fileName}.${ file.type}`
            });
          }
        });
      });

      // Push the upload promise to the results array
      results.push(uploadPromise);
    }

    // Return a promise that resolves when all uploads are complete
    return Promise.all(results);
  } catch (error) {
    console.log(error);
    return error;
  }
}

const _uploadCSV = async (file, folderName, fileType, fileNameIs) => {
  try {
    let fileName = fileNameIs !== undefined ? fileNameIs.replace(/\s/g, '_') : new Date().getTime().toString();

    let fileToStore = file.buffer;

    let mimeType = "text/csv";

    return new Promise((resolve, reject) => {
      console.log("S3 upload...!!!")
        
      if (folderName == undefined || folderName == "") {
        folderName = 'files';
      }
      
      var profile = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${folderName}/${fileName}.${fileType}`,
        // ACL: 'public-read',
        Body: fileToStore,
        ContentType: mimeType
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
            URL: `${process.env.AWS_S3_URL}/${folderName}/${fileName}.${fileType}`,
            address: `${folderName}/${fileName}.${fileType}`,
            name: `${fileName}.${fileType}`
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
const uploadPDFFromBase64 = async (file, folderName) => {

  let documentIs = file;
  let fileName = file.fileName !== undefined ? file.fileName : new Date().getTime().toString();

  let base64Content;
  if (documentIs.includes(',')) {
    base64Content = documentIs.split(',')[1]; // Split and get the base64 string
  } else {
    base64Content = documentIs; // Already a base64 string
  }
      
  let mimeType;
  if (file.type === "csv") {
    mimeType = "text/csv";
  } else if (file.type === "image" || file.type === "jpeg" || file.type === "jpg" || file.type === "png") {
    mimeType = 'image/jpeg';
  } else if (file.type === "pdf") {
    mimeType = "application/pdf";
  } else if (file.type === "doc") {
    mimeType = "application/msword";
  } else {
    mimeType = 'application/octet-stream';
  }

  let fileToStore = Buffer.from(base64Content, 'base64');

  // Create a promise for each file upload
  const uploadPromise = new Promise((resolve, reject) => {
    console.log("S3 upload...!!!")
      
    if (folderName == undefined || folderName == "") {
      folderName = 'customer_documents';
    }
    
    var profile = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${folderName}/${fileName}.${file.type}`,
      ACL: 'public-read',
      Body: fileToStore,
      ContentType: mimeType,
      ContentEncoding: 'base64'
    };
  
    s3.putObject(profile, function (err, rese) {
      if (err) {
        console.log('--------------ERROR---------------', err);
        resolve({
          status: 0,
          err: err
        });
      } else {
        console.log('--------------Solve---------------', `${process.env.AWS_S3_URL}${folderName}/${fileName}.${file.type}`);
        resolve({
          status: 1,
          URL: `${process.env.AWS_S3_URL}${folderName}/${fileName}.${ file.type}`,
          address: `${folderName}/${fileName}.${file.type}`,
          name: `${fileName}.${file.type}`,
          category: file.category,
          file: `${process.env.AWS_S3_URL}${folderName}/${fileName}.${ file.type}`
        });
      }
    });
  });

  return uploadPromise;
};

const uploadPDF = async (file, folderName, fileNameIs) => {
  let fileName = file.originalname ? file.originalname.split('.')[0] : fileNameIs;
  let mimeType = file.mimetype;

  // Default folderName if not provided
  if (!folderName) {
    folderName = 'customer_documents';
  }

  const uploadPromise = new Promise((resolve, reject) => {
    console.log("S3 upload...!!!");

    var profile = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${folderName}/${fileName}.${file.originalname.split('.').pop()}`,
      ACL: 'public-read',
      Body: file.buffer,
      ContentType: mimeType,
    };

    s3.putObject(profile, function (err, data) {
      if (err) {
        console.log('--------------ERROR---------------', err);
        resolve({
          status: 0,
          err: err
        });
      } else {
        const fileURL = `${process.env.AWS_S3_URL}${folderName}/${fileName}.${file.originalname.split('.').pop()}`;
        console.log('--------------Solve---------------', fileURL);
        resolve({
          status: 1,
          URL: fileURL,
          address: `${folderName}/${fileName}.${file.originalname.split('.').pop()}`,
          name: `${fileName}.${file.originalname.split('.').pop()}`,
          category: file.category,
          file: fileURL
        });
      }
    });
  });

  return uploadPromise;
}

module.exports = {
  _upload,
  _uploadCSV,
  _delete,
  uploadPDF,
  listOfDocuments
};