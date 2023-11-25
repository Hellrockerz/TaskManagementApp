const express = require('express')
const mongoose = require('mongoose');
const cron = require('node-cron')
const taskDeleter =  require('./cron/cron').taskDeleter

const PORT = 4000
const app = express()
const MONGODB_URI = 'mongodb://127.0.0.1:27017/Kodagu';

mongoose.connect('mongodb://127.0.0.1:27017/Kodagu');

const db = mongoose.connection


db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });
db.once('open', () => {
    console.log(`MongoDB connected at ${MONGODB_URI}`);
  });
  
app.use(express.json());

const userRoutes = require('./routes');

app.use("/api", userRoutes);

//The cron will start in every 10minutes and actually delete tasks from the DB
//you can use this-> "*/10 * * * * *", to test it every 10 seconds
cron.schedule('*/10 * * * *', taskDeleter)

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app;