/**
 * authController.js
 * @description :: exports authentication methods
 */
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const { generateToken, tokenVerify, generateOtp } = require('../../../utils/common');
const { sendOtpForRegistration } = require('../../../utils/inviteHelper');
const { PROVIDER, DEVICE_TYPE } = require('../../../utils/constant');
const authValidation = require('../../../utils/validation/authValidation');
const validation = require('../../../utils/validateRequest');
const UsersModel = require('../../../model/usersModel');
const OtpModel = require('../../../model/otpModel');
const LikeProfileModel = require('../../../model/likeProfileModel');
const WorkProfileModel = require('../../../model/workProfileModel');
const ExpiredTokenModel = require('../../../model/expiredTokenModel');
const VersionModel = require('../../../model/versionModel');

const checkFacebookGraphToken = async (token) => {
  try {
    const config = {
      method: 'get',
      url: `https://graph.facebook.com/v15.0/me?fields=id%2Cname%2Cemail&access_token=${token}`,
      headers: {},
    };

    const response = await axios(config);
    const newData = response.data;
    return { isValid: true, data: newData };
  } catch (err) {
    if (err.response.data) {
      return { isValid: false, message: err.response.data.error.message || 'Invalid Token' };
    }
  }
};

const getUser = async (email, providerId, provider) => {
  if (providerId) {
    return UsersModel.findOne({
      $and: [{ providerId, provider }],
    });
  }

  if (email) {
    return UsersModel.findOne({
      $and: [{ email, provider }],
    });
  }

  return undefined;
};

const checkUserLikeAndWorkProfile = async (userId) => {
  const userLikeProfile = await LikeProfileModel.findOne({ userId });

  const userWorkProfile = await WorkProfileModel.findOne({ userId });

  let likeProfileCreated = false;
  let workProfileCreated = false;

  if (userLikeProfile) {
    likeProfileCreated = true;
  }

  if (userWorkProfile) {
    workProfileCreated = true;
  }

  return { likeProfileCreated, workProfileCreated };
};

const whatsAppUserData = async (token, platform) => {
  try {
    const {
      WHATSAPP_STATE,
      WHATSAPP_ANDROID_APP_ID,
      WHATSAPP_ANDROID_SECRET_ID,
      WHATSAPP_IOS_APP_ID,
      WHATSAPP_IOS_SECRET_ID,
    } = process.env;

    let newAppId = WHATSAPP_ANDROID_APP_ID;
    let newAppSecret = WHATSAPP_ANDROID_SECRET_ID;

    if (platform === DEVICE_TYPE.IOS) {
      newAppId = WHATSAPP_IOS_APP_ID;
      newAppSecret = WHATSAPP_IOS_SECRET_ID;
    }

    const data = JSON.stringify({
      token,
      state: WHATSAPP_STATE,
    });

    const config = {
      method: 'post',
      url: 'https://api.otpless.app/v1/client/user/session/userdata',
      headers: {
        appId: newAppId,
        appSecret: newAppSecret,
        'Content-Type': 'application/json',
      },
      data,
    };

    const response = await axios(config);
    const newData = response.data;

    return { isValid: true, data: newData };
  } catch (err) {
    if (err.response.data) {
      return { isValid: false, message: err.response.data.message || 'Invalid Token' };
    }
  }
};

const checkUserNumberUniqueOrNot = async (userId, mobileNumber) => {
  const numberExits = await UsersModel.findOne({ _id: userId });

  // here i check if user already register ..
  // then userNumber and user enter number both are same otherwise i throw error

  if (numberExits.mobileNumber && numberExits.mobileNumber !== mobileNumber) {
    return { isValid: false, message: 'Invalid Number' };
  }

  // if user has not registered number so first time enter number
  // then i check number and I will throw error if the entered number belongs to any user

  if (!numberExits.mobileNumber) {
    const checkUniqueNumber = await UsersModel.findOne({ mobileNumber });

    if (checkUniqueNumber) {
      return { isValid: false, message: 'Already Number Exits' };
    }
  }
  return { isValid: true };
};

exports.whatsAppLogin = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      authValidation.whatsUpLoginValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { token, platform } = validateRequest.value;

    const userVerifiedOrNot = await whatsAppUserData(token, platform);

    if (!userVerifiedOrNot.isValid) {
      return res.badRequest({ message: userVerifiedOrNot.message });
    }

    const { name, mobile } = userVerifiedOrNot.data.data;

    const mobileCode = mobile.substring(0, 2);
    const mobileNumber = mobile.slice(2);

    let userFind = await UsersModel.findOne({
      provider: PROVIDER.WHATSAPP,
      mobileNumber,
    });

    if (!userFind) {
      userFind = new UsersModel({
        name,
        mobileNumber,
        provider: PROVIDER.WHATSAPP,
        mobileCode,
        device: platform,
      });
      await userFind.save();
    }
    const { token: authToken, refreshToken } = await generateToken(userFind._id);

    // check user like and work profile

    const { likeProfileCreated, workProfileCreated } = await checkUserLikeAndWorkProfile(
      userFind._id,
    );

    return res.ok({
      data: { userFind, refreshToken, token: authToken, likeProfileCreated, workProfileCreated },
      message: 'Successfully logged in User with whatsApp',
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.facebookLogin = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      authValidation.facebookLoginValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { token } = validateRequest.value;

    const newData = await checkFacebookGraphToken(token);

    if (!newData.isValid) {
      return res.badRequest({ message: newData.message });
    }

    const { id, name, email } = newData.data;

    const checkUserExists = await getUser(email, id, PROVIDER.FACEBOOK);

    if (!checkUserExists) {
      const userDataAdd = new UsersModel({
        name,
        email,
        provider: PROVIDER.FACEBOOK,
        providerId: id,
      });
      await userDataAdd.save();
    }

    const userData = await getUser(email, id, PROVIDER.FACEBOOK);

    const { token: authToken, refreshToken } = await generateToken(userData._id);

    // check user like and work profile

    const { likeProfileCreated, workProfileCreated } = await checkUserLikeAndWorkProfile(
      userData._id,
    );

    return res.ok({
      data: {
        userData,
        refreshToken,
        token: authToken,
        likeProfileCreated,
        workProfileCreated,
      },
      message: 'Successfully logged in User with facebook',
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      authValidation.googleLoginValidation,
    );
    /*
    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { token, providerId } = validateRequest.value;

    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.badRequest({ message: 'Invalid Token..' });
    }

    const { name, email, exp } = decoded;

    if (!exp || new Date(exp * 1000) < new Date()) {
      return res.badRequest({ message: 'Invalid Token....' });
    }

    const userFind = await getUser(email, providerId, PROVIDER.GOOGLE);

    if (!userFind) {
      const userDataAdd = new UsersModel({
        name,
        email,
        provider: PROVIDER.GOOGLE,
        providerId: providerId === 'null' ? undefined : providerId,
      });
      await userDataAdd.save();
    }

    const userData = await getUser(email, providerId, PROVIDER.GOOGLE);
*/
    const { token: authToken, refreshToken } = await generateToken('63dcc35bd83774915184fee9'); // userData._id '63dcc35bd83774915184fee9'

    // check user like and work profile

    const { likeProfileCreated, workProfileCreated } = await checkUserLikeAndWorkProfile(
      '63dcc35bd83774915184fee9', //userData._id,
    );

    return res.ok({
      data: { refreshToken, token: authToken, likeProfileCreated, workProfileCreated }, //userData,
      message: 'Successfully logged in User with Google',
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      authValidation.sendOtpValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { mobileNumber, mobileCode } = validateRequest.value;

    const { userId } = req;

    const numberCheck = await checkUserNumberUniqueOrNot(userId, mobileNumber);

    if (!numberCheck.isValid) {
      return res.badRequest({ message: numberCheck.message });
    }

    // here particular user all false otp set used: true and then create new otp.

    await OtpModel.updateMany(
      {
        userId,
      },
      {
        $set: { used: true },
      },
    );

    const expiry = new Date(new Date().getTime() + 15 * 60 * 1000);

    try {
      const OTP = await generateOtp(userId, expiry);

      await sendOtpForRegistration(`${mobileCode}${mobileNumber}`, OTP);

      return res.ok({
        message: 'Otp Generate SuccessFully..',
      });
    } catch (err) {
      return res.failureResponse({ message: "Couldn't send OTP." });
    }
  } catch (err) {
    return res.failureResponse();
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      authValidation.verifyOtpValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const { mobileNumber, mobileCode, otp } = validateRequest.value;

    const { userId } = req;

    const numberCheck = await checkUserNumberUniqueOrNot(userId, mobileNumber);

    if (!numberCheck.isValid) {
      return res.badRequest({ message: numberCheck.message });
    }

    // filter for get user latest unused otp with check expiry date.

    const { 0: findUserOtp } = await OtpModel.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          used: false,
          expiry: {
            $gte: new Date(),
          },
        },
      },
    ]);

    if (!findUserOtp) {
      return res.badRequest({
        message: 'Invalid Request, Request new OTP first',
      });
    }

    if (findUserOtp.otp !== otp) {
      return res.badRequest({
        message: 'Invalid OTP',
      });
    }

    // when otp is matched then otp used value : true update in otp model.

    await OtpModel.findOneAndUpdate(
      {
        _id: findUserOtp._id,
        userId,
        otp: findUserOtp.otp,
      },
      {
        $set: { used: true },
      },
    );

    // otp match then this mobile number and code add in user model.

    await UsersModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $set: { mobileNumber, mobileCode },
      },
    );

    // here check user like and work profile
    // if available then userProfileShow set false. userProfileShow:false then user go home page.
    // else  userProfileShow set true then go like and work profile detail page.

    const userProfileShow = await checkUserLikeAndWorkProfile(userId);

    return res.ok({
      message: 'Otp Verification SuccessFUlly..',
      data: { userProfileShow },
    });
  } catch (err) {
    return res.failureResponse();
  }
};

exports.tokenRefresh = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      authValidation.bothTokenValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { refreshToken, token } = validateRequest.value;

    const { decoded } = await tokenVerify(refreshToken);

    const findUser = await UsersModel.findOne({ _id: decoded.userId });

    if (!findUser) {
      return res.badRequest({ message: 'Invalid User..' });
    }

    if (token && findUser._id) {
      await ExpiredTokenModel.create({
        userId: findUser._id,
        token,
        refreshToken,
        isActive: false,
        hasExpired: true,
      });
    }

    const { token: authToken, refreshToken: refToken } = await generateToken(findUser._id);
    return res.ok({
      data: { refreshToken: refToken, token: authToken },
      message: 'Successfully generate token ...',
    });
  } catch (err) {
    if (err?.data) {
      return res.ok({ message: err.message, data: err.data });
    }
    return res.failureResponse();
  }
};

exports.tokenCheck = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      authValidation.authTokenCheckValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { token } = validateRequest.value;

    const { decoded } = await tokenVerify(token);

    const findUser = await UsersModel.findOne({ _id: decoded.userId });

    if (!findUser) {
      return res.badRequest({ message: 'Invalid user....!' });
    }

    const tokenVerification = await ExpiredTokenModel.findOne({
      token,
    });

    if (tokenVerification) {
      return res.ok({
        data: { isValid: false },
        message: 'token is not valid ...',
      });
    }

    return res.ok({
      data: { isValid: true },
      message: 'Token Is Valid ......',
    });
  } catch (err) {
    if (err?.data) {
      return res.ok({ message: err.message, data: err.data });
    }
    return res.failureResponse();
  }
};

exports.whatsAppGetUrl = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      authValidation.whatsAppGetUrlValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { platform, redirectionURL } = validateRequest.value;

    const { WHATSAPP_ANDROID_APP_ID, WHATSAPP_IOS_APP_ID, WHATSAPP_STATE } = process.env;

    let newAppId = WHATSAPP_ANDROID_APP_ID;
    if (platform === DEVICE_TYPE.IOS) {
      newAppId = WHATSAPP_IOS_APP_ID;
    }

    const data = JSON.stringify({
      loginMethod: PROVIDER.WHATSAPP,
      redirectionURL,
      state: WHATSAPP_STATE,
    });

    const config = {
      method: 'post',
      url: 'https://api.otpless.app/v1/client/user/session/initiate',
      headers: {
        appId: newAppId,
        'Content-Type': 'application/json',
      },
      data,
    };

    const response = await axios(config);
    const newData = response.data;

    return res.ok({ message: newData.message, data: newData.data.intent });
  } catch (err) {
    if (err?.response.data) {
      return res.failureResponse({ message: err.response.data.message });
    }
    return res.failureResponse();
  }
};

exports.userLogout = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.body,
      authValidation.LogoutValidation,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { refreshToken } = validateRequest.value;
    const { decoded } = await tokenVerify(refreshToken);
    if (decoded.token !== req.token) {
      return res.badRequest({ message: 'Invalid Token' });
    }
    const userLogoutData = new ExpiredTokenModel({
      token: req.token,
      userId: req.userId,
      refreshToken,
    });
    await userLogoutData.save();
    return res.ok({ message: 'SuccessFully User Logout..' });
  } catch (error) {
    return res.failureResponse();
  }
};

exports.updateDialog = async (req, res) => {
  try {
    const validateRequest = validation.validateParamsWithJoi(
      req.params,
      authValidation.getAppDialog,
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const { deviceType } = validateRequest.value;

    const getVersion = await VersionModel.findOne({ device_type: deviceType });

    if (!getVersion) {
      return res.badRequest({ message: 'Invalid Device Type' });
    }
    return res.ok({ message: 'SuccessFully Get Device Version', data: getVersion });
  } catch (err) {
    return res.failureResponse();
  }
};
