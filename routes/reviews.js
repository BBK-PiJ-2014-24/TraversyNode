
const express = require('express');
const reviewController = require('../controllers/ReviewController');
const queryHandler = require('../middleware/queryHandler');
const authHandler = require('../middleware/authHandler');
const ReviewModel = require('../models/Review');

const router = express.Router({mergeParams: true}); // merge Routes for redirection


router.route('/').get(queryHandler(ReviewModel, {path: 'bootcamp', select: 'name description'}), reviewController.getReviews);


module.exports = router;