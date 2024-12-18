const { google } = require('googleapis');
const request = require('request');
const notificationSchema = require('../models/notificationStorage');
const serviceAccount = require('../uobo-2e6e2-firebase-adminsdk-c3ubb-f6a7dc07aa.json');
//todo: change the service account file to your own service account file

const sendFirebaseNotification = async (token, title, body, data, category, senderId, receiverId, isSenderDealer) => {
  try {
    const authClient = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    
    const accessToken = await authClient.getAccessToken();
    
    const payload = {
      message: {
        notification: {
          title: title,
          body: body,
          // sound: "surprise.mp3",
        },
        data: {
          orderid: 'orderId',
          distance: 'latlong',
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title,
          body
        },
        token: token
      }
    };

    const options = {
      method: 'POST',
      url: `https://fcm.googleapis.com/v1/projects/uobo-2e6e2/messages:send`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    };

    request(options, async function (error, response) {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Sending Notification");
        console.log(response.body);
        await storeNotification(title, body, category, senderId, receiverId, isSenderDealer);
      }
    });

  } catch (error) {
    console.log(error);
  }
}

const storeNotification = async (title, body, category, senderId, receiverId, isSenderDealer) => {
  let addNotification = await new notificationSchema({
    title,
    body,
    category,
    senderId,
    receiverId,
    isSenderDealer
  });

  if (addNotification) {
    return addNotification.save();
  } else {
    return false;
  }
}

module.exports = { sendFirebaseNotification };
