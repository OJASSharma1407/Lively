require('dotenv').config();
const express = require('express');
const cron = require('./cron/remainder');
const mongoose = require('mongoose');
const cors = require('cors');
const reminderJob = require('./cron/remainder');
const port = process.env. PORT; 
const mongo_Url = process.env.MONGO_URL;
const app = express();
//Middle ware
app.use(cors());
app.use(express.json());
//DataBase
mongoose.connect(mongo_Url).then(()=>{
    console.log("DataBase connected sucessfully");
}).catch(err=>{
    console.log(err);
})

reminderJob();

//Routes
app.use('/user',require('./routes/userAuth'));
app.use('/tasks',require('./routes/tasks'));

app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})

