
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize'); // PREVENT NoSQL INJECTION ATTACKS 
const xssClean = require('xss-clean'); // PREVENT XSS CROSS-SITE ATTACKS
const rateLimit = require("express-rate-limit"); // PREVENT DOS DENIAL OF SERVICE ATTACKS
const hpp = require('hpp'); // PREVENT PARAM POLUTION ATTACKS
const cors = require('cors'); // PREVENT CORS ATTACKS 
const helmet = require('helmet'); // SECURITY HEADERS ON RES OBJ
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./middleware/loggerHandler');
const mongooseErrorHandler = require('./middleware/mongooseErrorHandler');
const morgan = require('morgan'); // a server log package
const colors = require('colors'); // Add colors to console log msg
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Route Files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth')
const reviews = require('./routes/reviews');
const users = require('./routes/users');

// Load the env variables
dotenv.config({ path: './config/config.env'});
const PORT = process.env.PORT || 5000;

// Connect to the Mongo DB
connectDB();

// Set up Express
const app = express();
app.use(express.json());

// Cookie middleware
app.use(cookieParser());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(logger); // custom made logger
    app.use(morgan('dev')); // a logger package on npm
}
//  ** SECURITY **
//  **==========**
// PREVENT NoSQL INJECTION ATTACKS
app.use(mongoSanitize());

// PREVENT XSS CROSS-SITE SCRIPTING ATTACKS
 app.use(xssClean());

// PREVENT DOS ATTACKS WITH RATE LIMITER
const limiter = rateLimit({
    windowMs: 10*60*100, // 10mins
    max: 100
});
app.use(limiter);

// PREVENT HTTP PARAM POLUTION
app.use(hpp());

// PREVENT CORS ATTACKS
app.use(cors());

// SET SECURITY HEADERS to Res Obj
app.use(helmet());



// File Upload Middleware from 'Express-Fileupload'
app.use(fileupload());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public', )));

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use(mongooseErrorHandler);


 // Run the Server
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle MongoDB promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(()=> process.exit(1));
});
