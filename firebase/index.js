const firebase = require('firebase-admin');

firebase.initializeApp({
    credential: firebase.credential.cert({
        "type": "service_account",
        "project_id": "push-notification-cf089",
        "private_key_id": process.env.private_key_id,
        "private_key": process.env.private_key,
        "client_email": process.env.client_email,
        "client_id": process.env.client_id,
        "auth_uri": process.env.auth_uri,
        "token_uri": process.env.token_uri,
        "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
        "client_x509_cert_url": process.env.client_x509_cert_url,
        "universe_domain": "googleapis.com"
    })
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