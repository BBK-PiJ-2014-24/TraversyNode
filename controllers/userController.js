
const dotenv = require('dotenv');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');


// @desc: GET All Users
// @route: GET /api/v1/users
// @access: private/Admin
// Using asyncHandler
const getUsers = asyncHandler( async(req, res, next) => {
    res.status(200)
       .json(res.queryResults);
}); 

// @desc: GET User By ID
// @route: GET /api/v1/users/:id
// @access: private/Admin
// Using asyncHandler
const getUserById = asyncHandler( async(req, res, next)=> {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorResponse(`User with id:${req.params.id} Not Found`, 404));
    }

    res.status(200)
       .json({
        success:true,   
        data: user
        });

});


// @desc: Create User
// @route: POST /api/v1/users
// @access: private/Admin
// Using asyncHandler
const createUser = asyncHandler( async(req, res, next)=> {

    const newUser = await User.create(req.body);

    res.status(201)
       .json({
           success: true,
           data: newUser
       });

});


// @desc: Update User By ID
// @route: PUT /api/v1/users/:id
// @access: private/Admin
// Using asyncHandler
const updateUser = asyncHandler( async(req, res, next)=> {

    const config = {new: true, runValidators: true};
    const user = await User.findByIdAndUpdate(req.params.id, req.body, config);

    res.status(200)
       .json({
           success: true,
           data: user
       }); 
});


// @desc: Delete User By ID
// @route: DELETE /api/v1/users/:id
// @access: private/Admin
// Using asyncHandler
const deleteUser = asyncHandler( async(req, res, next)=> {

    const deleteUser = await User.findByIdAndDelete(req.params.id);

    res.status(200)
       .json({
           success: true,
           data: deleteUser
       }); 
});

// Exports
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
