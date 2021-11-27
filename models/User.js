const dotenv = require('dotenv');
const mongoose =  require('mongoose');
const crypto = require('crypto');
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
        enum: ['user', 'publisher','admin'],
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

// Add pre-save mongoose middleware for password encryption 
// --------------------------------------------------------
UserSchema.pre('save', async function(next){

  // Move on if password is not changed. (i.e. during a password reset) 
  if(!this.isModified('password')){
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
}); 

// Create a Json Web Token that will include the user id
// This is a method as the method runs on an actual user
// -----------------------------------------------------
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
// -----------------------------------------------------------------
UserSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Will return true or false
}

// Generate and hash new token if password forgotten
//---------------------------------------------------
 UserSchema.methods.getResetPasswordToken = function(){

  // Generate Token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Update resetPasswordToken field on DB in hashed form
  this.resetPasswordToken =  crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set Expire field on DB
  this.resetPasswordExpire = Date.now() + (10*60*1000);

 // Return reset 
 return resetToken;

 } 


//                             (CollectionName, Schema)
module.exports = mongoose.model('User', UserSchema);
