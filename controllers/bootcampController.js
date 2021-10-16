const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const geocoder = require('../utils/geocoder');


// @desc: Get All bootcamps
// @route: GET /api/v1/bootcamps
// @access: public 
// Using asyncHandler
const getBootcamps = asyncHandler (async (req, res, next) => {
        const bootcamps = await Bootcamp.find();

        res.status(200).json({success: true, count: bootcamps.length, msg: 'Show all Bootcamps', data: bootcamps});
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
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp id:${req.params.id} not found`, 404));
        }

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

// Exports
// -------
exports.getBootcamps = getBootcamps;
exports.getBootcampById = getBootcampById;
exports.createBootcamp = createBootcamp;
exports.updateBootcamp = updateBootcamp;
exports.deleteBootcamp = deleteBootcamp;
exports.getBootcampsInRadius = getBootcampsInRadius;
