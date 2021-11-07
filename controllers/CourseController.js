const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

const queryHandler = require('../middleware/queryHandler');
const CourseModel = require('../models/Course');


// @desc: Get All Courses with Query and Pagination functionality
// @route: GET /api/v1/courses
// @route: GET /api/v1/bootcamps/:bootcampId/courses
// @access: public 
// Using asyncHandler
const getCourses = asyncHandler (async (req, res, next) => {
    // Determine which Route is selected
    if (req.params.bootcampId){
        const courses = await Course.find({bootcamp: req.params.bootcampId});
        return res.status(200).json({success: true, count: courses.length, data: courses });
    } else {
        res.status(200).json(res.queryResults);
    }

});

// @desc: Get All Course by Id
// @route: GET /api/v1/courses/:id
// @access: public 
// Using asyncHandler
const getCourseById = asyncHandler (async (req, res, next) => {

    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    }); // Execute Query

    if(!course){
        return next(new ErrorResponse(`No Course Found with id: ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        count: course.length,
        data: course
    });
});

// @desc: POST - Add A Course, but only by the Bootcamp publisher or Admin
// @route: POST /api/v1/bootcamps/:bootcampId/courses
// @access: private 
// Using asyncHandler
const addCourse = asyncHandler (async (req, res, next) => {

    // Put bootcamp and user id into the req.body
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    // Check if bootcamp exists
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if(!bootcamp){
        return next(new ErrorResponse(`No Bootcamp Found with id: ${req.params.bootcampId}`, 404));
    }

    // Make sure the user is the publisher for the bootcamp or is admin
    if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.user.id} does not have authorization to Add a Course to the bootcamp`), 401);
    }


    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        count: course.length,
        data: course
    });
});

// @desc: PUT - Update a Course
// @route: PUT /api/v1/courses/:courseId
// @access: private 
// Using asyncHandler
const updateCourse = asyncHandler (async (req, res, next) => {

    let course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorResponse(`No Course Found with id: ${req.params.id}`, 404));
    }

    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(
            `User ${req.user.id} is not authorized to update course ${course._id}`,
            401
          )
        );
    }
    
    
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    } );

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc: DELETE - Update a Course
// @route: DELETE /api/v1/courses/:courseId
// @access: private 
// Using asyncHandler
const deleteCourse = asyncHandler (async (req, res, next) => {

     const course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorResponse(`No Course Found with id: ${req.params.id}`, 404));
    }
    
    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete course ${course._id}`,
                401
            )
        );
    }
   
    await course.remove();

    res.status(200).json({
        success: true,
        data: course
    });
});

// Exports
// -------
exports.getCourses = getCourses;
exports.getCourseById = getCourseById;
exports.addCourse =  addCourse;
exports.updateCourse = updateCourse; 
exports.deleteCourse = deleteCourse;
