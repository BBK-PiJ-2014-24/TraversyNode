const crypto = require('crypto');
const dotenv = require('dotenv');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');


// @desc: Register User and send token to user to keep him online
// @route: POST /api/v1/auth/register
// @access: public 
// Using asyncHandler
const registerUser = asyncHandler( async(req, res, next) => {

    const {name, email, password, role} = req.body;

    // Create a user with Mongoose.
    const  user = await User.create({
        name, 
        email,
        password,
        role,
    });

    // Successful login - send token in cookie
    sendCookieTokenResponse(user, 200, res);
}); 


// @desc: Login User
// @route: POST /api/v1/auth/login
// @access: public 
// Using asyncHandler
const loginUser = asyncHandler( async(req, res, next) => {

    const {email, password} = req.body;

    // Validate email and password
    if(!email || !password){
        return next(new ErrorResponse('Please Find email and password', 400));
    }

    // Check if user login exists
    const user = await User.findOne({email}).select('+password');// have to add password field as it is not given by default
    if(!user){
        return next(new ErrorResponse('User Not Found', 400));
    }

    // Check password
    const isCorrectPassword = await user.checkPassword(password); // all bcrypt function return a promise and therefore require await
    if(!isCorrectPassword){
        return next(new ErrorResponse('Invalid credentials', 400));
    }

    // Successful login - send token in cookie
    sendCookieTokenResponse(user, 200, res);
}); 


// Helper function that wraps the token in a cookie and sends out a response with a res.cookie
const sendCookieTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken(); // called on the mongoose instance

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE *24 *60 *60* 1000 ),  
        httpOnly:true,
        secure: false
    };

    // send cookie via secure https if not run in dev
    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    // Send out a res with a cookie('key',value, options  
    res.status(statusCode)
       .cookie('token', token, options)
       .json({
           success:true,
           token,
           message: 'Sent Cookie Successfully' 
       });

}

// @desc: GET current logged-in Usert
// @route: GET /api/v1/auth/me
// @access: private 
// Using asyncHandler
const getMyLogin = asyncHandler( async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Return Login Data to Client',
        body: user
    });
})

// @desc: Log out User and Clear Cookie
// @route: GET /api/v1/auth/logout
// @access: private
// Using asyncHandler
const logout = asyncHandler( async (req, res, next) => {
  
    // Send a new replacement token (and thereby negating the old one) that expires in 10sec
    res.cookie('token', 'none', 
        {expires: new Date(Date.now() +10 *1000), httpOnly: true});  // expires in 10sec


    res.status(200).json({
        success: true,
        message: 'Logout User',
        body: {}
    });
})

// @desc: Update User Details - name and email
// @route: PUT /api/v1/auth/updatedetails
// @access: private 
// Using asyncHandler
const updateDetails = asyncHandler( async (req, res, next) => {

    const updatedFields = {
        name: req.body.name,
        email: req.body.email,
    };

    const config = {
        new: true,
        runValidators: true
    };

    const user = await User.findByIdAndUpdate(req.user.id, updatedFields, config);

    if(!user){
        return next(new ErrorResponse(`User with ID:${req.user.id} not found`, 404));
    }

    res.status(200).json({
        success: true,
        message: 'Return Login Data to Client',
        body: user
    });
})

// @desc: PUT  Update User Password
// @route: GET /api/v1/auth/updatepassword
// @access: private 
// Using asyncHandler
const updatePassword = asyncHandler( async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    const currentPassword = await user.checkPassword(req.body.currentPassword);

    // check current password
    if(!currentPassword){
        return next(new ErrorResponse(`Password for User id:${req.user.id} not found`, 401));
    }

    // Append to req 
    user.password = req.body.newPassword;

    // Save to DB
    await user.save();

    // Send Token
    sendCookieTokenResponse(user, 200, res);

})


// @desc: Forgot Password 
// @route: GET /api/v1/auth/forgotpassword
// @access: public 
// Using asyncHandler
const forgotPassword = asyncHandler( async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorResponse(`No Login for email ${req.body.email}`, 404))
    }

    // Get Reset Token
    const resetToken = user.getResetPasswordToken();

    // Save the ResetToken Field Change
    await user.save({validateBeforeSave: false});

    // Set up Email
    const confirmEmailURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        })
        
        res.status(200).json({
            success: true,
            message: 'Return an email for a New Token to authorize a password reset',
            body: user
        });
    }catch(err){
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        // save to db
        await user.save({validateBeforeSave: false});
        return next(new ErrorResponse('Email Could Not Be Sent', 500));
    }

})


// @desc: Reset Password
// @route: PUT /api/v1/auth/resetpassword/:resettoken
// @access: public
// Using asyncHandler
const resetPassword = asyncHandler( async (req, res, next) => {

    // Get Hashed Token
    const resetPasswordToken = crypto.createHash('sha256')
                                     .update(req.params.resettoken)
                                     .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if(!user){
        return next(new ErrorResponse('Invalid Token. User Not Found', 400));
    }

    // Set New Password
    user.password = req.body.password;

    // Clear Reset Variables
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save to DB
    await user.save();

    sendCookieTokenResponse(user, 200, res);

})
exports.registerUser = registerUser; 
exports.loginUser = loginUser;
exports.getMyLogin = getMyLogin;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
exports.updateDetails = updateDetails;
exports.updatePassword = updatePassword;
exports.logout = logout;