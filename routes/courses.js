const express = require('express');
const courseController = require('../controllers/CourseController');

const router = express.Router({mergeParams: true}); // merge Routes for redirection

router.route('/').get(courseController.getCourses)
                 .post(courseController.addCourse);

router.route('/:id').get(courseController.getCourseById)
                    .put(courseController.updateCourse)
                    .delete(courseController.deleteCourse);

module.exports = router;