const express = require('express');
const authHandler = require('../middleware/authHandler');
const authController = require('../controllers/authController');


const router = express.Router();


router.route('/register')
      .post( authController.registerUser );

router.route('/login')
      .post(authController.loginUser);

router.route('/logout')
      .get(authController.logout);      

router.route('/me')
      .get(authHandler.protectRoute, authController.getMyLogin);

router.route('/updatedetails')
      .put(authHandler.protectRoute, authController.updateDetails);      

router.route('/updatepassword')
      .put(authHandler.protectRoute, authController.updatePassword);      

      router.route('/forgotpassword')
      .post(authController.forgotPassword);

router.route('/resetpassword/:resettoken')
      .put(authController.resetPassword);

module.exports = router;

