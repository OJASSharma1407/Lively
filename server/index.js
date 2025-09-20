require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const port = process.env. PORT; 
const mongo_Url = process.env.MONGO_URL;
const app = express();

mongoose.connect(mongo_Url).then(()=>{
    console.log("DataBase connected sucessfully");
}).catch(err=>{
    console.log(err);
})



app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})

