const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    notification:{type:String,required:true},
    time:{type:Date,default:Date.now},
    taskId:{type:mongoose.Schema.Types.ObjectId,ref:'Tasks'},
    read:{type:Boolean,default:false}
})

module.exports = mongoose.model("Notifications",NotificationSchema);