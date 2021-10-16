class ErrorResponse extends Error {

    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        // console.log('STATUS CODE:....', this.statusCode);
    }

}

module.exports = ErrorResponse;