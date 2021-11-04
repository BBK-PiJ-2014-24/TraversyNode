const dotenv = require('dotenv');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

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


exports.registerUser = registerUser; 
exports.loginUser = loginUser;