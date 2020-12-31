const express = require('express');
const router = express.Router();
const {authMiddleware,isRestaurantOwner} = require('../middleware/authMiddleware');
const {tableBooking,getAllBooking,getPendingBookings,confirmPendingBookings,rejectBooking} = require('../controllers/bookingController')
const {tableBookingRules} = require('../Helper/inputValidationHelper');

router.get('/tableBooking',authMiddleware,tableBookingRules,tableBooking);

router.get('/getAllBooking',authMiddleware,isRestaurantOwner,tableBookingRules,tableBooking);

router.get('/getPendingBookings',authMiddleware,isRestaurantOwner,tableBookingRules,tableBooking);

router.get('/confirmPendingBookings',authMiddleware,isRestaurantOwner,tableBookingRules,tableBooking);

router.get('/rejectBooking',authMiddleware,isRestaurantOwner,tableBookingRules,tableBooking);



