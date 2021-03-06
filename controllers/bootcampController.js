const dotenv = require('dotenv');
const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const geocoder = require('../utils/geocoder');


// @desc: Get All bootcamps with Query and Pagination functionality
// @route: GET /api/v1/bootcamps
// @access: public 
// Using asyncHandler
const getBootcamps = asyncHandler (async (req, res, next) => {

    res.status(200).json(res.queryResults); /// from the queryHandler Middleware
});

// @desc: Get single bootcamps
// @route: GET /api/v1/bootcamps/:id
// @access: public 
const getBootcampById = async (req, res, next) => {
    try{
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp id:${req.params.id} not found`, 404));
        }
        res.status(200).json({success: true, msg: `Get Bootcamp by Id ${req.params.id}`, data: bootcamp});
    } catch(err){
        next(err);
    }
}

// @desc: CREATE new Bootcamp only if admin or a publisher(max 1 bootcamp)
// @route: POST /api/v1/bootcamps
// @access: public 
const createBootcamp = async (req, res, next) => {
    try {
        // Add user to the req.body
        req.body.user = req.user.id // req.user comes from the authHandler middleware

        // Check if the user has already published another Bootcamp already 
        // This is a logic violation unless is an 'Admin'
        const publishedBootcamp =  await Bootcamp.findOne({user: req.user.id});
        if(publishedBootcamp && req.user.role !== 'admin') {
            return next(new ErrorResponse(`The User with ID ${req.user.id} Does not have authorization to Create Another Bootcamp`, 400));
        }

        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({success: true, msg: 'Create Bootcamp', data: bootcamp});
    } catch(err) {
        next(err);
    }
};

// @desc: UPDATE Bootcamp only if Admin or the publisher for the bootcamp in question
// @route: POST /api/v1/bootcamps/:id
// @access: public 
const updateBootcamp = async (req, res, next) => {
    try{
        let bootcamp = await Bootcamp.findById(req.params.id);
        // Check if bootcamp exists
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp id:${req.params.id} not found`, 404));
        }
        // make sure the user is the publisher for the bootcamp or is admin
        if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.id} does not have authorization to update this bootcamp`), 401);
        }
        // Ready to Update  
        const mongooseConfig = {new: true, runValidators: true};
        bootcamp  = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, mongooseConfig);
        res.status(200).json({success: true, msg: `Update Bootcamps with Id ${req.params.id}`, data: bootcamp});
    } catch {
       next(err);
    } 
};

// @desc: DELETE Bootcamp only if the publisher of the bootcamp or is admin
// @route: DELETE /api/v1/bootcamps/:id
// @access: public 
const deleteBootcamp = async (req, res, next) => {

    try {
        let bootcamp = await Bootcamp.findById(req.params.id);
        // Check if bootcamp exists
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp id:${req.params.id} not found`, 404));
        }
        // Make sure the user is the publisher for the bootcamp or is admin
        if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin'){
            return next(new ErrorResponse(`User ${req.user.id} does not have authorization to Delete this bootcamp`), 401);
        }
        
        bootcamp.remove();

        res.status(200).json({success: true, msg: `Delete Bootcamp with Id ${req.params.id}`, data: {}});
    } catch (err) {
        next(err);
    }
}

// @desc: Get bootcamps within given distance
// @route: GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access: public 
// Using asyncHandler
const getBootcampsInRadius = asyncHandler (async (req, res, next) => {

        const {zipcode, distance} = req.params;

        //Get lat/lng
        const loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;

        // Calc Radius using radians
        // divide distance by radius of earth 3,963 miles / 6,378km
        const earthRadius = 3963;
        const radius = distance /earthRadius;
        
        const bootcamps = await Bootcamp.find({
            location: {$geoWithin: {$centerSphere: [[lng, lat], radius] } }
        });

        res.status(200).json({success: true, count: bootcamps.length, msg: `Show all Bootcamps within ${distance} mile radius`, data: bootcamps});
});

// @desc: upload photo for bootcamp
// @route: PUT /api/v1/bootcamps/:id/photo
// @access: private 
const uploadBootcampPhoto = asyncHandler (async (req, res, next) => {

    let bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp id:${req.params.id} not found`, 404));
    }

    // make sure the user is the publisher for the bootcamp or is admin
    if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} does not have authorization to update this bootcamp`), 401);
    }
    
    // file validation checks
    if(!req.files){
        return next(new ErrorResponse('No File Attached', 400));
    }
    const file = req.files.file;
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse('Invalid File Type. Must be an Image', 400));
    }
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Image Size Too Large. Max Image Size is ${process.env.MAX_FILE_UPLOAD} bits`, 400));
    }

    // Rename file for storage and move to public folder 
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    console.log('file name', file.name);
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) =>{
        if(err){
            console.error(err);
            return next(new ErrorResponse(`Internal Storage Error`, 500));
        }
        // Add File Image path to Bootcamp DB
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

        res.status(200).json({
            success: true,
            data: file.name
        });
    });    
});

// Exports
// -------
exports.getBootcamps = getBootcamps;
exports.getBootcampById = getBootcampById;
exports.createBootcamp = createBootcamp;
exports.updateBootcamp = updateBootcamp;
exports.deleteBootcamp = deleteBootcamp;
exports.getBootcampsInRadius = getBootcampsInRadius;
exports.uploadBootcampPhoto = uploadBootcampPhoto;