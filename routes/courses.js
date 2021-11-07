const express = require('express');
const courseController = require('../controllers/CourseController');
const queryHandler = require('../middleware/queryHandler');
const authHandler = require('../middleware/authHandler');
const CourseModel = require('../models/Course');

const router = express.Router({mergeParams: true}); // merge Routes for redirection

router.route('/').get(queryHandler(CourseModel, {path: 'bootcamp', select: 'name description'}), courseController.getCourses)
                 .post(authHandler.protectRoute, authHandler.authorizeRoute('publisher', 'admin'), courseController.addCourse);

router.route('/:id').get(courseController.getCourseById)
                    .put(authHandler.protectRoute, authHandler.authorizeRoute('publisher', 'admin'), courseController.updateCourse)
                    .delete(authHandler.protectRoute, authHandler.authorizeRoute('publisher', 'admin'), courseController.deleteCourse);

module.exports = router;