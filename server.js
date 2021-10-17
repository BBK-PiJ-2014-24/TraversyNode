const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/error');
const morgan = require('morgan'); // a server log package
const colors = require('colors'); // Add colors to console log msg
const connectDB = require('./config/db');

// Route Files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

// Load the env variables
dotenv.config({ path: './config/config.env'});
const PORT = process.env.PORT || 5000;

// Connect to the Mongo DB
connectDB();


const app = express();
app.use(express.json());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(logger); // custom made logger
    app.use(morgan('dev'));
}


// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use(errorHandler);


 // Run the Server
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle MongoDB promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(()=> process.exit(1));
});
