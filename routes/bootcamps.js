const express = require('express');
const bootcampController =require('../controllers/bootcampController');

/// Include Other Resource Routers for Joins
const courseRouter = require('./courses');

// Initialize the Router
const router = express.Router();

// Re-direct Route into other routes
router.use('/:bootcampId/courses', courseRouter);



router.route('/radius/:zipcode/:distance')
      .get(bootcampController.getBootcampsInRadius);

router.route('/:id/photo')
      .put(bootcampController.uploadBootcampPhoto);      

router.route('/')
      .get(bootcampController.getBootcamps)
      .post(bootcampController.createBootcamp);
      
router.route('/:id')
      .get(bootcampController.getBootcampById)
      .put(bootcampController.updateBootcamp)
      .delete(bootcampController.deleteBootcamp);      

module.exports = router;