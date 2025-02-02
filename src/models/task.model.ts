import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    authorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    taskTitle:{
        type:String,
        required:true
    },
    taskType:{
        type:String,
        required:true
    },
    taskNumberofRespondent:{
        type:Number,
        required:true
    },
    taskDescription:{
        type:String,
        required:true
    },
    taskLocation:{
        type:String
    },
    taskCompensation:{
        type:Number,
        required:true
    },
    taskDeadline:{
        type:Number,
        required:true
    },
    taskRequirements:{
        type:String,
        required:true,
    },
    taskLinkUpload:{
        type:String,
        default:""
    },
    taskLinkUploadTwo:{
        type:String,
        default:""
    },
    taskImage:{
        type:String,
    },
    cloudinary_id:{
        type:String,
    },  
}, {
    timestamps:true
})

export default mongoose.model("Task", taskSchema)