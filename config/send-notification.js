var request = require('request');
const notificationSchema = require('../models/notificationStorage');

const sendFirebaseNotification = async (token, title, body, data, category, senderId, receiverId, isSenderDealer) => {

  try {
    
    const payload = {
      notification: {
        title: title,
        body: body,
        sound: "surprise.mp3",
      },
      data: {
        orderid: 'orderId',
        distance: 'latlong',
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        title,
        body
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
    console.log(error)
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

module.exports = { sendFirebaseNotification }