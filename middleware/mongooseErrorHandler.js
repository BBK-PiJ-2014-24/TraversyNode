const ErrorResponse = require('../utils/errorResponse');

// A Handler for Mongoose Errors after the query sent to the DB
 const mongooseErrorHandler = (err, req, res, next) => {
    console.log(err.stack.red);

    console.log(err);
    let error  = {...err}; // copy error obj to functions own error variable
    error.message = err.message; 

    // Incorrect Mongoose ObjectId submitted to the server
    if(err.name === 'CastError'){
        const message = `Resource id:${err.value} is not found`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose Error for duplicating a dev camp with the same key
    if(err.code === 11000 ){
        const message = `Duplicate Dev Camp value entered`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose Error for incorrect Inputs on Creation
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(value => value.message);
        error = new ErrorResponse(message, 400);
    }

    res.status( err.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error Emitted from errorHandler'
    });
}

module.exports = mongooseErrorHandler;
