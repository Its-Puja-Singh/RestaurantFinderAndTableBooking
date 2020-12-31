const User = require('../model/userModel.js');
const { createJwt } = require('../Helper/jwtTokenHelper.js');
const { generateRandomString } = require('../Helper/encryptionHelper');
const { sendEmail } = require('../Helper/emailHelper');
const { VERIFICATION_TEMPLATE, FORGET_PASSWORD_TEMPLATE, USER_LOCK_TEMPLATE } = require('../config/keys');
const { enums } = require('../constants');
const { imageUpload } = require('../Helper/imageUploadHelper.js');
const upload = imageUpload('profile-picture/');
const singleUpload = upload.single('image');

module.exports = {
    getAllUsers: async (req, res, next) => {
      try {
        const users = await User.find({}).select(
          "-password  -createdAt -updatedAt -salt -__v"
        );
        return res.status(200).json({ "message": "ALL USER", data: users });
      } catch (e) {
        next(e);
      }
    },
    registerUser: async (req, res, next) => {
      try {
        const { userName, email, password } = req.body;
        const isUser = await User.findOne({
          email,
        });
        if (isUser) {
          if (isUser.emailVerified === false)
            return res.error("UN-VERIFIED_USER. VERIFY_YOUR_ACCOUNT");
          if (isUser.emailVerified === true)
            return res.error("USER_ALREADY_EXIST. YOU CAN LOGIN");
        } else {
          const verificationEmailToken = generateRandomString(16);
          const newUser = new User({
            email,
            userName,
            verificationEmailToken,
          });
          const data = {
            templateId: VERIFICATION_TEMPLATE,
            receiver: email,
            name: userName,
            token: `/user/activation/${verificationEmailToken}`,
          };
          await newUser.setPassword(password);
          const emailSent = await sendEmail(data);
          if (emailSent)
            return res.status(200).json({"message":`Verification Link has been sent to ${email}`});
          return res.status(400).json({"message":"SOMETHING WENT WRONG"});
        }
      } catch (e) {
        next(e);
      }
    },
    activateAccount: async (req, res, next) => {
      try {
        const { verificationEmailToken } = req.params;
        const user = await User.findOne({
          verificationEmailToken: verificationEmailToken,
        });
        if (!user) {
          return res.status(400).json({"message":"NO USER FOUND. PLEASE SIGNUP"});
        }
        const isTokenExpired = new Date().getTime() > user.tokenExpiresIn;
        if (isTokenExpired) {
          return res.error("YOUR_LINK_IS_EXPIRED");
        }
        const result = await User.verifyUser(verificationEmailToken);
        user.role = enums.USER_ROLES.USER;
        const payload = {
          user: {
            id: user.id,
          },
        };
        const token = await createJwt(payload);
        await user.save();
        user.password = undefined;
        user.salt = undefined;
        user.createdAt = undefined;
        user.updatedAt = undefined;
        return res.status(200).json({
          message: "YOUR EMAIL IS SUCCESSFULLY VERIFIED...!, NOW YOU CAN LOGIN",
          data: { token },
        });
      } catch (e) {
        next(e);
      }
    },
    regenerateToken: async (req, res, next) => {
      try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
          return res.error("NO USER FOUND. PLEASE SIGNUP");
        }
        // eslint-disable-next-line no-cond-assign
        if (user.emailVerified === true)
          return res.status(400).json({"message":"YOU ARE ALREADY VERIFIED. YOU CAN LOGIN"});
        user.verificationEmailToken = generateRandomString(16);
        user.tokenExpiresIn = new Date().setMinutes(new Date().getMinutes() + 10);
        const data = {
          templateId: VERIFICATION_TEMPLATE,
          receiver: user.email,
          name: user.userName,
          token: `/user/activation/${user.verificationEmailToken}`,
        };
        await user.save();
        const emailSent = await sendEmail(data);
        logger.info(data);
        if (emailSent)
          return res.status(200).json({"message":`Your verification link has been sent to ${user.email}`});
        return res.status(400).json({"message":"SOMETHING WENT WRONG"});
      } catch (e) {
        next(e);
      }
    },
    login: async (req, res, next) => {
      try {
        const isUser = await User.findOne({
          email: req.body.email,
        });
        if (!isUser) return res.status(400).json({"message":"USER IS NOT REGISTERED"});
        if (isUser.emailVerified === false)
          return res.status(400).json({"message":"YOUR EMAIL IS NOT VERIFIED. KINDLY VERIFY FIRST"});
        const maxLoginAttempts = 5;
        if (
          isUser.loginAttempts >= maxLoginAttempts &&
          new Date().getTime() < isUser.lockUntil
        ) {
          return res.status(400).json({ message: "TRY AFTER SOMETIME" });
        }
        const isMatch = await isUser.comparePassword(req.body.password);
        if (isMatch) {
          isUser.loginAttempts = 0;
          await isUser.save();
          const payload = {
            user: {
              id: isUser.id,
            },
          };
          const token = await createJwt(payload);
          isUser.password = undefined;
          isUser.salt = undefined;
          isUser.createdAt = undefined;
          isUser.updatedAt = undefined;
          logger.info(isUser);
          return res.status(200).json({ message: "LOGIN SUCCESSFUL", data: { isUser, token } });
        }
        isUser.loginAttempts += 1;
        await isUser.save();
        if (isUser.loginAttempts === maxLoginAttempts) {
          isUser.lockUntil = new Date().setMinutes(new Date().getMinutes() + 30);
          await isUser.save();
          const data = {
            templateId: USER_LOCK_TEMPLATE,
            receiver: isUser.email,
            name: isUser.userName,
            token: "",
          };
          await sendEmail(data);
          return res.status(400).json({ message: "USER LOCKED" });
        }
        return res.status(400).json({ message: "INVALID PASSWORD" });
      } catch (e) {
        next(e);
      }
    },
    forgetPassword: async (req, res, next) => {
      try {
        const isUser = await User.findOne({ email: req.body.email });
        if (!isUser) return res.status(400).json({"message":"NO USER_IS_FOUND"});
        if (isUser.emailVerified === false)
          return res.status(400).json({"message":"YOUR_EMAIL_IS_NOT_VERIFIED. KINDLY_VERIFY_FIRST"});
        isUser.forgotPasswordToken = generateRandomString(16);
        isUser.tokenExpiresIn = new Date().setMinutes(
          new Date().getMinutes() + 10
        );
        const data = {
          templateId: FORGET_PASSWORD_TEMPLATE,
          receiver: isUser.email,
          name: isUser.userName,
          token: `/user/forgetPassword/${isUser.forgotPasswordToken}`,
        };
        isUser.password = undefined;
        isUser.salt = undefined;
        isUser.createdAt = undefined;
        isUser.updatedAt = undefined;
        const emailSent = await sendEmail(data);
        await isUser.save();
        if (emailSent)
          return res.status(200).json({"message":`Password Reset Link has been sent to ${isUser.email}`});
        return res.status(400).json("SOMETHING WENT WRONG");
      } catch (e) {
        next(e);
      }
    },
    forgetTokenVerification: async (req, res, next) => {
      try {
        const { forgotPasswordToken } = req.params;
        const user = await User.findOne({
          forgotPasswordToken: forgotPasswordToken,
        });
        if (!user) {
          return res.status(400).json("SEVER ERROR");
        }
        const isTokenExpired = new Date().getTime() > user.tokenExpiresIn;
        if (isTokenExpired) {
          return res.status(400).json("LINK EXPIRED");
        }
        // user is redirected to form with the email address
        res.render("forgetPassword", { user });
      } catch (e) {
        next(e);
      }
    },
    changePassword: async (req, res, next) => {
      try {
        const { forgotPasswordToken } = req.params;
        const user = await User.findOne({
          forgotPasswordToken: forgotPasswordToken,
        });
        await user.setPassword(req.body.password);
        await user.save();
        logger.info(user);
        return res.status(200).json({"message":"YOUR PASSWORD HAS BEEN UPDATED SUCCESSFULLY"});
      } catch (e) {
        next(e);
      }
    },
    resetPassword: async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id);
        if (!user) return res.error("NO USER FOUND");
        const { oldPassword, newPassword } = req.body;
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) return res.error("OLD PASSWORD IS INVALID");
        if (newPassword) {
          await user.setPassword(newPassword);
          user.password = undefined;
          user.salt = undefined;
          user.createdAt = undefined;
          user.updatedAt = undefined;
        } else {
          return res.status(400).json({"message":"PASSWORD DOES NOT MATCH"});
        }
        return res.status(200).json({
          message: "YOUR PASSWORD HAS BEEN UPDATED SUCCESSFULLY",
          data: user,
        });
      } catch (e) {
        next(e);
      }
    },
    getUserData: async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id).select(
          "-password -createdAt -updatedAt -salt -__v"
        );
        return res.status(200).json({ data: user });
      } catch (e) {
        next(e);
      }
    },
    userUpdate: async (req,res,next) => {
      try {
          const user = await User.findById(req.user.id);
          if (!user) return res.error('EMAIL_UNAVAILABLE');
          const { userName, firstName, lastName, about, phone, area, location, city, state, country, zipCode } = req.body;
          user.about = about;
          user.phone = phone;
          user.firstName = firstName;
          user.lastName = lastName;
          user.userName = userName;
          user.address.area = area;
          user.address.location = location;
          user.address.city = city;
          user.address.state = state;
          user.address.country = country;
          user.address.zipCode = zipCode;
          user.password = undefined;
          user.createdAt = undefined;
          user.updatedAt = undefined;
          user.salt = undefined;
          await user.save();
          return res.status(200).json({ data: user });
      } catch (e) {
        next(e);
      }
    },
    pictureUpdate: async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id);
        if (!user) return res.error('EMAIL_UNAVAILABLE');
        singleUpload(req, res, async err => {
          if (err) {
            return res.status(400).json({ data: err });
          }
          if (req.file !== undefined) {
            user.imageUrl = req.file.location;
            user.imageName = req.file.key;
            user.password = undefined;
            user.salt = undefined;
            user.createdAt = undefined;
            user.updatedAt = undefined;
            await user.save();
            return res.status(200).json({ "message":"Picture Updated Successfullt", data: user });
          }
        });
      } catch (e) {
        next(e);
      }
    },
  };
  