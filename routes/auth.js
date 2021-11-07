const express = require('express');
const authHandler = require('../middleware/authHandler');
const authController = require('../controllers/authController');


const router = express.Router();


router.route('/register')
      .post( authController.registerUser );

router.route('/login')
      .post(authController.loginUser);

router.route('/me')
      .get(authHandler.protectRoute, authController.getMyLogin);

router.route('/forgotpassword')
      .post(authController.forgotPassword);

module.exports = router;

