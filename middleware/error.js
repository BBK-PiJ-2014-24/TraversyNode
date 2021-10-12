const ErrorResponse = require('../utils/errorResponse');


 const errorHandler = (err, req, res, next) => {
    console.log(err.stack.red);

    let error  = {...err}; // copy error obj to functions own error variable
    error.message = err.message; 

    // Incorrect Mongoose ObjectId submitted to the server
    if(err.name === 'CastError'){
        const message = `Bootcamp id:${err.value} is not found`;
        error = new ErrorResponse(message, 404);
    }

    res.status( err.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error Emitted from errorHandler'
    });
}

module.exports = errorHandler;
