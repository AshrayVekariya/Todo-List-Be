const firebase = require('firebase-admin');

const serviceAccount = require('../firebase.config.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
})

// send notification
const sendNotification = async (token, message) => {
    let notificationDetails = {
        token: token,
        notification: {
            title: "Todo App",
            body: message
        },
        data: {
            title: "Todo App",
            message: message
        },
    }
    try {
        await firebase.messaging().send(notificationDetails);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { sendNotification }