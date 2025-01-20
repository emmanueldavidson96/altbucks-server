import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
    earnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    email:{
        type:String,
        required:false,
    },
    status: {
        type:String,
        enum:["pending", "accepted", "cancelled"],
        default:"pending",
        required:true,
    },
    sentAt: {
        type:Date,
        default:null,
    },
    acceptedAt: {
        type:Date,
        default:null,
    },
}, {
    timestamps:true
})

export default mongoose.model("Referral", referralSchema)