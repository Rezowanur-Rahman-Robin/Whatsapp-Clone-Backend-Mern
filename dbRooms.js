import mongoose from 'mongoose';

const roomSchema=mongoose.Schema({
    name:String,
    timestamp:String
});

export default mongoose.model(`roomContent`,roomSchema);