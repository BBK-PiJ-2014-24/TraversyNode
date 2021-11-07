const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');


const protectRoute = asyncHandler( async (req, res, next)=> {

    // Pick up token from header using a split 'Bearer token' => [1]
    // or from within a cookie
    let token;
    if(req.headers.authorization  && req.headers.authorization.startsWith('Bearer') ){
        token = req.headers.authorization.split(' ')[1];
        console.log('Inside header');
    } else if (req.cookies.token){
        console.log('Inside Cookie');
        token = req.cookies.token;
    }

    // Check if no token
    if(!token){
        return next( new ErrorResponse('Authorization Denied', 401));
    }


    try {
    // decode token
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    console.log('DecodedToken: ', decodedToken);
    // Add User to req obj
    req.user = await User.findById(decodedToken.id);
    next();
    } catch(err) {
        return next( new ErrorResponse('Authorization Denied', 401));
    }


});

// Control Access to Certain Job Roles
const authorizeRoute = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next (new ErrorResponse(`User Role ${req.user.role} Does Not Have Authorization`), 403);
        }
        next();
    }
}

exports.protectRoute = protectRoute;
exports.authorizeRoute = authorizeRoute;





