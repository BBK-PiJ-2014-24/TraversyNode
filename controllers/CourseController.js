const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');


// @desc: Get All Courses with Query and Pagination functionality
// @route: GET /api/v1/courses
// @route: GET /api/v1/bootcamps/:bootcampId/courses
// @access: public 
// Using asyncHandler
const getCourses = asyncHandler (async (req, res, next) => {
    let query;
    // Determine which Route is selected
    if (req.params.bootcampId){
        query = Course.find({bootcamp: req.params.bootcampId});
    } else {
        query = Course.find();
    }

    const courses = await query; // Execute Query

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

exports.getCourses = getCourses;

