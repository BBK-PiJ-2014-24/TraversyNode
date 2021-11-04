const mongoose = require('mongoose');
const coloris = require('colors');

const connectDB = async ()=> {

    const config = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }

    const connection = await mongoose.connect(process.env.MONGO_URI, config);
    
    console.log(`MongoDB Connected: ${connection.connection.host}`.cyan.underline.bold);

};

module.exports = connectDB;