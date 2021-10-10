const Bootcamp = require('../models/Bootcamp');




// @desc: Get All bootcamps
// @route: GET /api/v1/bootcamps
// @access: public 
const getBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find();

        res.status(200).json({success: true, count: bootcamps.length, msg: 'Show all Bootcamps', data: bootcamps});
    } catch (err) {
        res.status(400).json({success: false});
    }
}

// @desc: Get single bootcamps
// @route: GET /api/v1/bootcamps/:id
// @access: public 
const getBootcampById = async (req, res, next) => {
    try{
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return res.status(400).json({success:false, msg: `No bootcamp found with id ${req.params.id}`});
        }
        res.status(200).json({success: true, msg: `Get Bootcamp by Id ${req.params.id}`, data: bootcamp});
    } catch(err){
        res.status(400).json({success: false});
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
        res.status(400).json({success: false});
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
            return res.status(400).json({success: false, msg: `No bootcamp found with id ${req.params.id}`});
        }
        res.status(200).json({success: true, msg: `Update Bootcamps with Id ${req.params.id}`, data: bootcamp});
    } catch {
        res.status(400).json({success: false});   
    } 
};

// @desc: DELETE Bootcamp
// @route: DELETE /api/v1/bootcamps/:id
// @access: public 
const deleteBootcamp = async (req, res, next) => {

    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if(!bootcamp){
            return res.status(400).json({success: false, msg: `No bootcamp found with id ${req.params.id}`});
        }

        res.status(200).json({success: true, msg: `Delete Bootcamp with Id ${req.params.id}`, data: {}});
    } catch (err) {
        res.status(400).json({success: false});   
    }
}


// Exports
// -------
exports.getBootcamps = getBootcamps;
exports.getBootcampById = getBootcampById;
exports.createBootcamp = createBootcamp;
exports.updateBootcamp = updateBootcamp;
exports.deleteBootcamp = deleteBootcamp;
