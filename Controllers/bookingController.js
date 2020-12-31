const Restaurant = require('../models/restaurantModel');
const Booking =require('../models/bookingModel');
const { enums } = require('../constants');
const { sendEmail } = require('../helper/emailHelper');
const {BOOKING_CONFIRM_TEMPLATE,CREATE_BOOKING_TEMPLATE,BOOKING_REJECTED_TEMPLATE} =require('../config/keys')
module.exports={
    tableBooking: async (req,res,next) => {
        try{
            const {name,email,date,bookingDate,noOfGuests}=req.body;
            const {restaurantId}=req.params;
            const options={name,email,date,bookingDate,noOfGuests,}
            const restaurant =await Restaurant.findbyId(restaurantId);
            if(restaurant){
                const newBooking=new Booking(options);
                await newBooking.save();
                const data = {
                    templateId: CREATE_BOOKING_TEMPLATE,
                    receiver: email,
                    name: name,
                    token: '',
                };
                await sendEmail(data);
                return res.status(200).json({"message":"Booking Request sent", "data":newBooking});
            }
            return res.status(404).json({"message":"Cannot find the the resataurant"});
        }
        catch(e){
            next(e);
        }   
    },
    getAllBooking:async (req,res,next)=>{
        try {
            const restaurantId = req.params.restaurantId;
            const allBookings = await Restaurant.findById(restaurantId);
            return res.status(200).json({"data": allBookings});
        } catch (e) {
            next(e);
        }
    
    },
    getPendingBookings:async (req,res,next)=>{
        try {
            const restaurantId = req.params.restaurantId;
            const allBookings = await Restaurant.find({restaurantId:restaurantId, bookingStatus:"PENDING"});
            return res.status(200).json({"data": allBookings});
        } catch (e) {
            next(e);
        }
    },
    confirmPendingBookings:async (req,res,next)=>{
        try {
            const bookingId = req.params.bookingId;
            const booking=await findById(bookingId);
            if(booking) {
                booking.bookingStatus=enums.STATUS.CONFIRMED;
                await booking.save();
                const data = {
                    templateId: BOOKING_CONFIRM_TEMPLATE,
                    receiver: booking.email,
                    name: booking.name,
                    token: '',
                };
                await sendEmail(data);
                return res.status(200).json({"meassage": "Booking Confirmed Successfully", "data":booking});
            }      
        } catch (e) {
            next(e);
        }
    },
    rejectBooking:async (req,res,next)=>{
        try {
            const bookingId=req.params.bookingId;
            const booking=await findById(bookingId);
            if(booking) {
                booking.bookingStatus=enums.STATUS.REJECTED;
                await booking.save();
                const data = {
                    templateId: BOOKING_REJECTED_TEMPLATE,
                    receiver: booking.email,
                    name: booking.name,
                    token: '',
                };
                await sendEmail(data);
                return res.status(200).json({"meassage": "Booking Confirmed Successfully", "data":booking});
            }      
        } catch (e) {
            next(e);
        }
    }
}
