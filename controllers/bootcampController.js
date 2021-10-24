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

    let query;
    const reqQuery = {...req.query};  // copy req.query

    // Temporarily Remove 'SELECT', 'SORT', 'LIMIT', 'PAGE' from query and focus on WHERE conditions
    const removeFields = ['select, sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery); //create String from query
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`); // Add '$' for mongoose fn $lte

    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');  // DB Query 

    // Add SELECT FROM fields to query
    if(req.query.select){
        const fields = req.query.select.split(',').join(' '); // convert multiple fields in query object into a string
        query = query.select(fields);
    }

    // Add SORT (use by date as default and DESC)
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // PAGINATION
    const page = parseInt(req.query.page, 10) || 1; //base 10
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit; // to allow the query to start on any page
    const endIndex = page * limit;
    const totalDocs = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Execute Query
    const bootcamps = await query;

    // Pagination Meta Data - API tells the client what is the next and prev page
    const pagination = {};

    if(endIndex < totalDocs){
        pagination.next = {
            page: page +1,
            limit: limit,
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page: page -1,
            limit
        }
    }

    res.status(200).json({success: true, count: bootcamps.length, msg: 'Show all Bootcamps', pagination: pagination, data: bootcamps});
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

// @desc: CREATE new Bootcamp
// @route: POST /api/v1/bootcamps
// @access: public 
const createBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({success: true, msg: 'Create Bootcamp', data: bootcamp});
    } catch(err) {
        next(err);
    }
};

// @desc: UPDATE Bootcamp
// @route: POST /api/v1/bootcamps/:id
// @access: public 
const updateBootcamp = async (req, res, next) => {
    try{
        const mongooseConfig = {new: true, runValidators: true}
        const bootcamp  = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, mongooseConfig);
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp id:${req.params.id} not found`, 404));
        }
        res.status(200).json({success: true, msg: `Update Bootcamps with Id ${req.params.id}`, data: bootcamp});
    } catch {
       next(err);
    } 
};

// @desc: DELETE Bootcamp
// @route: DELETE /api/v1/bootcamps/:id
// @access: public 
const deleteBootcamp = async (req, res, next) => {

    try {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp id:${req.params.id} not found`, 404));
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

    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp id:${req.params.id} not found`, 404));
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