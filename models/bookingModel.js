const {Types, Schema} = require("mongoose");
const { models, enums } = require('../constants');

const schema = new Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    noOfGuests:{
        type:Number,
        required:true
    },
    bookingStatus:{
        type: String, enum: Object.values(enums.STATUS), default: enums.STATUS.PENDING,
    },
    bookingDate:{
        type:Date,
    },
    restaurantId:{
        type:Types.ObjectId,
    }
},{timestamps:true});

// Query class for Booking
class Booking {}

schema.loadClass(Booking);

module.exports = model(models.BOOKING, schema);