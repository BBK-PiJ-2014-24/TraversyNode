const express = require('express');
const courseController = require('../controllers/CourseController');
const queryHandler = require('../middleware/queryHandler');
const CourseModel = require('../models/Course');

const router = express.Router({mergeParams: true}); // merge Routes for redirection

router.route('/').get(queryHandler(CourseModel, {path: 'bootcamp', select: 'name description'}), courseController.getCourses)
                 .post(courseController.addCourse);

router.route('/:id').get(courseController.getCourseById)
                    .put(courseController.updateCourse)
                    .delete(courseController.deleteCourse);

module.exports = router;