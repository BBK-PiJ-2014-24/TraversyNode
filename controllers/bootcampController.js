// @desc: Get All bootcamps
// @route: GET /api/v1/bootcamps
// @access: public 
const getBootcamps = (req, res, next) => {
    res.status(200).json({success: true, msg: 'Show all Bootcamps'});
}

// @desc: Get single bootcamps
// @route: GET /api/v1/bootcamps/:id
// @access: public 
const getBootcampById = (req, res, next) => {
    res.status(200).json({success: true, msg: `Get Bootcamp by Id ${req.params.id}`});
}

// @desc: CREATE new Bootcamp
// @route: POST /api/v1/bootcamps
// @access: public 
const createBootcamp = (req, res, next) => {
    res.status(200).json({success: true, msg: 'Create Bootcamps'});
}

// @desc: UPDATE Bootcamp
// @route: POST /api/v1/bootcamps/:id
// @access: public 
const updateBootcamp = (req, res, next) => {
    res.status(200).json({success: true, msg: `Update Bootcamps with Id ${req.params.id}`});
}

// @desc: DELETE Bootcamp
// @route: DELETE /api/v1/bootcamps/:id
// @access: public 
const deleteBootcamp = (req, res, next) => {
    res.status(200).json({success: true, msg: `Delete Bootcamp with Id ${req.params.id}`});
}


// Exports
// -------
exports.getBootcamps = getBootcamps;
exports.getBootcampById = getBootcampById;
exports.createBootcamp = createBootcamp;
exports.updateBootcamp = updateBootcamp;
exports.deleteBootcamp = deleteBootcamp;
