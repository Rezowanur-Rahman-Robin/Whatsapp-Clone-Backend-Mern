import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
    message: String,
    name:String,
    timestamp:String,
    received:Boolean,
    roomId:String,
    uId:String
});

export default mongoose.model(`messageContent`,whatsappSchema);