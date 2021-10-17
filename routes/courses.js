const express = require('express');
const courseController = require('../controllers/CourseController');

const router = express.Router({mergeParams: true}); // merge Routes for redirection

router.route('/').get(courseController.getCourses);

module.exports = router;