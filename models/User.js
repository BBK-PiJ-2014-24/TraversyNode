const dotenv = require('dotenv');
const mongoose =  require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please add a name'],
      },
      email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email',
        ],
      },
      role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user',
      },
      password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
      },
      resetPasswordToken: String,
      resetPasswordExpire: Date,
      confirmEmailToken: String,
      isEmailConfirmed: {
        type: Boolean,
        default: false,
      },
      twoFactorCode: String,
      twoFactorCodeExpire: Date,
      twoFactorEnable: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },

});

// Add pre-save mongoose middleware for encryption 
UserSchema.pre('save', async function(next){
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
}); 

// Create a Json Web Token that will include the user id
// This is a method as the method runs on an actual user
UserSchema.methods.getSignedJwtToken = function() {
  const payload = {
    id: this._id,
  };
  const password = process.env.JWT_SECRET;
  const options = {
    expiresIn: process.env.JWT_EXPIRE
  };

  return jwt.sign(payload, password, options);
}

// Check user entered password matches the hashed password in the db
UserSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Will return true or false
}


//                             (CollectionName, Schema)
module.exports = mongoose.model('User', UserSchema);
