const express = require('express');
const bootcampController =require('../controllers/bootcampController');
const authHandler = require('../middleware/authHandler');
const BootcampModel = require('../models/Bootcamp');
const queryHandler = require('../middleware/queryHandler');


/// Include Other Resource Routers for Joins
const courseRouter = require('./courses');

// Initialize the Router
const router = express.Router();

// Re-direct Route into other routes
router.use('/:bootcampId/courses', courseRouter);



router.route('/radius/:zipcode/:distance')
      .get(bootcampController.getBootcampsInRadius);

router.route('/:id/photo')
      .put(authHandler.protectRoute, authHandler.authorizeRoute('publisher', 'admin'), bootcampController.uploadBootcampPhoto);      

router.route('/')
      .get(queryHandler(BootcampModel, 'courses'), bootcampController.getBootcamps)
      .post(authHandler.protectRoute, authHandler.authorizeRoute('publisher', 'admin'), bootcampController.createBootcamp);
      
router.route('/:id')
      .get(bootcampController.getBootcampById)
      .put(authHandler.protectRoute, authHandler.authorizeRoute('publisher', 'admin'), bootcampController.updateBootcamp)
      .delete(authHandler.protectRoute, authHandler.authorizeRoute('publisher', 'admin'), bootcampController.deleteBootcamp);      

module.exports = router;