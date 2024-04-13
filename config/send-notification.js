const OneSignal = require('onesignal-node');
const client = new OneSignal.Client(process.env.APP_ID, process.env.API_KEY);
// const userClient = new OneSignal.UserClient(process.env.USER_AUTH_KEY);

var sendOneSignalNotification = function(data,receiver_type,sender_type,receiverId,senderId,notification_Category,deviceType) {
    var headers;

    headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic MDE5YmRjNmMtMWI1ZS00MDY0LWJjNmYtZjRlN2ZkY2ZkY2U3"
    };

    let message = { 
      app_id: process.env.APP_ID,
      contents: {
          "en": bodyIs
      },
      headings: {"en": `${titleIs}`, "es": "Spanish Title"},
      data: notiDataIs,   
      content_available: 1,
      include_player_ids: [tokenIs.playerId],
      android_channel_id: "7935275a-4bcc-468b-a5e6-7042e8a44862"
  };

    // if(deviceType == "IOS"){
    //     if(receiver_type == true){
    //         headers = {
    //             "Content-Type": "application/json; charset=utf-8",
    //             "Authorization": "Basic NzA3MGIzMDItN2MzZS00OGI2LWIwODMtY2E5M2Q4Y2U1Nzkw"
    //           };
    //     }else if(receiver_type == false){
    //         headers = {
    //             "Content-Type": "application/json; charset=utf-8",
    //             "Authorization": "Basic MjM3NjdjMjctOWVmMS00Mzg3LTk0MzYtZGEzZjRmZWFkMjQz"
    //           };
    //     }else{
    //         headers = {
    //             "Content-Type": "application/json; charset=utf-8",
    //             "Authorization": "Basic NzA3MGIzMDItN2MzZS00OGI2LWIwODMtY2E5M2Q4Y2U1Nzkw"
    //           };
    //     }
    // }else if(deviceType == "Android"){
    //     if(receiver_type == true){
    //         headers = {
    //             "Content-Type": "application/json; charset=utf-8",
    //             "Authorization": "Basic NzRkMDhmMjAtNzhmOS00NDJjLTllZGUtMmU0M2M3YzYyZWY3"
    //           };
    //     }else if(receiver_type == false){
    //         headers = {
    //             "Content-Type": "application/json; charset=utf-8",
    //             "Authorization": "Basic MjM3NjdjMjctOWVmMS00Mzg3LTk0MzYtZGEzZjRmZWFkMjQz"
    //           };
    //     }else{
    //         headers = {
    //             "Content-Type": "application/json; charset=utf-8",
    //             "Authorization": "Basic NzRkMDhmMjAtNzhmOS00NDJjLTllZGUtMmU0M2M3YzYyZWY3"
    //           };
    //     }
    // }else{
    //     if(receiver_type == true){
    //         headers = {
    //             "Content-Type": "application/json; charset=utf-8",
    //             "Authorization": "Basic MDE5YmRjNmMtMWI1ZS00MDY0LWJjNmYtZjRlN2ZkY2ZkY2U3"
    //           };
    //     }else if(receiver_type == false){
    //         headers = {
    //             "Content-Type": "application/json; charset=utf-8",
    //             "Authorization": "Basic MjM3NjdjMjctOWVmMS00Mzg3LTk0MzYtZGEzZjRmZWFkMjQz"
    //           };
    //     }else{
    //         headers = {
    //             "Content-Type": "application/json; charset=utf-8",
    //             "Authorization": "Basic MDE5YmRjNmMtMWI1ZS00MDY0LWJjNmYtZjRlN2ZkY2ZkY2U3"
    //           };
    //     }
    // }
    
    var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers
    };
    
    var https = require('https');
    var req = https.request(options, function(res) {  
      res.on('data', function(data) {
        console.log("Response:");
        // console.log(JSON.parse(data));
      });
    });
    
    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
    });
    
    req.write(JSON.stringify(data));
    req.end();
};

module.exports = { sendOneSignalNotification }