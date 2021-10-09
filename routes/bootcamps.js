const express = require('express');
const bootcampController =require('../controllers/bootcampController');

const router = express.Router();

router.route('/')
      .get(bootcampController.getBootcamps)
      .post(bootcampController.createBootcamp);
      
router.route('/:id')
      .get(bootcampController.getBootcampById)
      .put(bootcampController.updateBootcamp)
      .delete(bootcampController.deleteBootcamp);      

module.exports = router;