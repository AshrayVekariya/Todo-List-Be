require('dotenv').config()
const express = require('express')
const app = express();
const cors = require('cors');
const cron = require('node-cron');
const path = require('path')

const connectMongoDB = require('./connection');
const router = require('./routes');
const { sendMail, sendSubTaskMail } = require('./middleware/reminder');

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'))
app.use("/public", express.static(path.join(__dirname, 'public')));

app.use('/', router);

cron.schedule('31 12 * * *', () => {
    sendMail();
    sendSubTaskMail();
});

// connection
const URI = process.env.DB_CONNECTION_URL
const PORT = process.env.PORT
connectMongoDB(URI)
    .then(() => {
        console.log('Database connected successfully!')
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        })
    })
    .catch((err) => console.error("Coudn't connect database", err));