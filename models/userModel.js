const mongoose =require('mongoose');
const {hashString, generateRandomString}=require('../helper/encryptionHelper');
const enums= require('../constants/enums');
const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        index:true,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    firstName:{
        type:String,
        trim:true,
        min:3,
        max:20
    },
    lastName:{
        type:String,
        trim:true,
        min:3,
        max:20
    },
    emailVerified: { 
        type: Boolean, 
        default: false 
    },
    loginAttempts: { 
        type: Number, 
        default: 0 
    },
    lockUntil: { 
        type: Number 
    },
    forgotPasswordToken: { 
        type: String, 
        default: '' 
    },
    tokenExpiresIn: { 
        type: Number, 
        default: new Date().setMinutes(new Date().getMinutes() + 10) 
    },
    role: { 
      type: String, 
      enum: Object.values(enums.USER_ROLES), 
      default: enums.USER_ROLES.NULL 
    },
    about: { 
        type: String, 
        maxlength: 500 
    },
    phone: { 
        type: String, 
        maxlength: 16, 
        trim: true 
    },
    password: { 
        type: String 
    },
    salt: { 
        type: String 
    },
    imageUrl: { 
        type: String, 
        default: 'https://robohash.org/24.218.243.24.png' 
    },
    role:{
        type: String, enum: Object.values(enums.USER_ROLES), default: enums.USER_ROLES.NULL,
    },
    contactNumber:{
        type:String,
    },
    profileImage:{
        type:String
    },
    dateOfBirth: { type: Date },
    address: {
      area: { 
        type: String, 
        trim: true 
      },
      location: { 
        type: String, 
        trim: true 
      },
      city: { 
        type: String, 
        trim: true 
      },
      state: { 
        type: String, 
        trim: true 
      },
      country: { 
        type: String, 
        trim: true 
      },
      zipCode: { 
        type: String, 
        maxlength: 8, 
        trim: true 
      },
    },
},{timestamps:true});

class User {
    comparePassword(password) {
      try {
        const rePassword = hashString(password, this.salt);
        return rePassword === this.password;
      } catch (e) {
        logger.error(e.message);
        return false;
      }
    }
  
    async setPassword(password) {
      this.salt = generateRandomString(16);
      this.password = hashString(password, this.salt);
      await this.save();
    }
  
    static async verifyUser(verificationToken) {
      try {
        const user = await this.findOne({
          verificationEmailToken: verificationToken,
        });
        user.verificationEmailToken = '';
        if (user.role === enums.USER_ROLES.USER) {
          user.businessEmailVerified = true;
          await user.save();
        } else {
          user.emailVerified = true;
          await user.save();
        }
        logger.info(user);
        return true;
      } catch (e) {
        logger.error(e.message);
        return false;
      }
    }
  }
  
  userSchema.loadClass(User);
module.exports=mongoose.model('User',userSchema);