// const OneSignal = require('onesignal-node');
// const client = new OneSignal.Client(process.env.APP_ID, process.env.API_KEY);
// const userClient = new OneSignal.UserClient(process.env.USER_AUTH_KEY);
var request = require('request');

const sendFirebaseNotification = async (token, title, body, data, category, senderId, receiverId) => {
  const payload = {
    title: "Order Alert",
    body: "New Order Alert Found For You.",
    data: {
        "sound": "surprise.mp3",
        "orderid": 'orderId',
        "distance": 'latlong',
        "click_action": "FLUTTER_NOTIFICATION_CLICK"
    },
    to: token
  };

  const options = {
      method: 'POST',
      url: 'https://fcm.googleapis.com/fcm/send',
      headers: {
        authorization: 'key=AAAAP6439ec:APA91bHQzNnkXviOs0Ap3l0MvJrpLJEj2PMjBp9MZVBKgz2tsud85IVmTMRPN3uyGdyz_qNQTDFqrxCDshPuBueMtk20xAn-_ftqj-HhYk2PMLKN6YohlOjWk35X41rKM00vBsLgCWU-',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
  };

  request(options, function (error, response) {
      if (error) {
          console.log(error.message);
      } else {
          console.log("Sending Notification");
          console.log(response.body);
      }
  });
}

// var sendOneSignalNotification1 = function(data,receiver_type,sender_type,receiverId,senderId,notification_Category,deviceType) {
//     var headers;

//     headers = {
//       "Content-Type": "application/json; charset=utf-8",
//       "Authorization": "Basic MDE5YmRjNmMtMWI1ZS00MDY0LWJjNmYtZjRlN2ZkY2ZkY2U3"
//     };

//     let message = { 
//       app_id: process.env.APP_ID,
//       contents: {
//           "en": bodyIs
//       },
//       headings: {"en": `${titleIs}`, "es": "Spanish Title"},
//       data: notiDataIs,   
//       content_available: 1,
//       include_player_ids: [tokenIs.playerId],
//       android_channel_id: "7935275a-4bcc-468b-a5e6-7042e8a44862"
//   };

//     // if(deviceType == "IOS"){
//     //     if(receiver_type == true){
//     //         headers = {
//     //             "Content-Type": "application/json; charset=utf-8",
//     //             "Authorization": "Basic NzA3MGIzMDItN2MzZS00OGI2LWIwODMtY2E5M2Q4Y2U1Nzkw"
//     //           };
//     //     }else if(receiver_type == false){
//     //         headers = {
//     //             "Content-Type": "application/json; charset=utf-8",
//     //             "Authorization": "Basic MjM3NjdjMjctOWVmMS00Mzg3LTk0MzYtZGEzZjRmZWFkMjQz"
//     //           };
//     //     }else{
//     //         headers = {
//     //             "Content-Type": "application/json; charset=utf-8",
//     //             "Authorization": "Basic NzA3MGIzMDItN2MzZS00OGI2LWIwODMtY2E5M2Q4Y2U1Nzkw"
//     //           };
//     //     }
//     // }else if(deviceType == "Android"){
//     //     if(receiver_type == true){
//     //         headers = {
//     //             "Content-Type": "application/json; charset=utf-8",
//     //             "Authorization": "Basic NzRkMDhmMjAtNzhmOS00NDJjLTllZGUtMmU0M2M3YzYyZWY3"
//     //           };
//     //     }else if(receiver_type == false){
//     //         headers = {
//     //             "Content-Type": "application/json; charset=utf-8",
//     //             "Authorization": "Basic MjM3NjdjMjctOWVmMS00Mzg3LTk0MzYtZGEzZjRmZWFkMjQz"
//     //           };
//     //     }else{
//     //         headers = {
//     //             "Content-Type": "application/json; charset=utf-8",
//     //             "Authorization": "Basic NzRkMDhmMjAtNzhmOS00NDJjLTllZGUtMmU0M2M3YzYyZWY3"
//     //           };
//     //     }
//     // }else{
//     //     if(receiver_type == true){
//     //         headers = {
//     //             "Content-Type": "application/json; charset=utf-8",
//     //             "Authorization": "Basic MDE5YmRjNmMtMWI1ZS00MDY0LWJjNmYtZjRlN2ZkY2ZkY2U3"
//     //           };
//     //     }else if(receiver_type == false){
//     //         headers = {
//     //             "Content-Type": "application/json; charset=utf-8",
//     //             "Authorization": "Basic MjM3NjdjMjctOWVmMS00Mzg3LTk0MzYtZGEzZjRmZWFkMjQz"
//     //           };
//     //     }else{
//     //         headers = {
//     //             "Content-Type": "application/json; charset=utf-8",
//     //             "Authorization": "Basic MDE5YmRjNmMtMWI1ZS00MDY0LWJjNmYtZjRlN2ZkY2ZkY2U3"
//     //           };
//     //     }
//     // }
    
//     var options = {
//       host: "onesignal.com",
//       port: 443,
//       path: "/api/v1/notifications",
//       method: "POST",
//       headers: headers
//     };
    
//     var https = require('https');
//     var req = https.request(options, function(res) {  
//       res.on('data', function(data) {
//         console.log("Response:");
//         // console.log(JSON.parse(data));
//       });
//     });
    
//     req.on('error', function(e) {
//       console.log("ERROR:");
//       console.log(e);
//     });
    
//     req.write(JSON.stringify(data));
//     req.end();
// };

module.exports = { sendFirebaseNotification }