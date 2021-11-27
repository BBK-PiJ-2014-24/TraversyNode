const express = require('express');
const userController = require('../controllers/userController');
const queryHandler = require('../middleware/queryHandler');
const authHandler = require('../middleware/authHandler');
const userModel = require('../models/User');

// Set Up Router
const router = express.Router();

// Route Protections at top
router.use(authHandler.protectRoute);
router.use(authHandler.authorizeRoute('admin'));


router.route('/').get(queryHandler(userModel), userController.getUsers)
                 .post(userController.createUser);

router.route('/:id').get(userController.getUserById)
                    .put(userController.updateUser)
                    .delete(userController.deleteUser);

module.exports = router;