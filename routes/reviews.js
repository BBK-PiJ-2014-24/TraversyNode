
const express = require('express');
const reviewController = require('../controllers/ReviewController');
const queryHandler = require('../middleware/queryHandler');
const authHandler = require('../middleware/authHandler');
const ReviewModel = require('../models/Review');

const router = express.Router({mergeParams: true}); // merge Routes for redirection


router.route('/').get(queryHandler(ReviewModel, {path: 'bootcamp', select: 'name description'}), reviewController.getReviews)
                 .post(reviewController.createReview);

router.route('/:id').get(reviewController.getReviewById)
                    .put(reviewController.updateReview)
                    .delete(reviewController.deleteReview);



module.exports = router;