const express = require('express');
const dotenv = require('dotenv');

// Load the env variables
dotenv.config({ path: './config/config.env'});
const PORT = process.env.PORT || 5000;
// Route Files
const bootcamps = require('./routes/bootcamps');


const app = express();

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);




app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));