const fs = require('fs');
const mongoose = require('mongoose');
const colors  = require('colors');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

// Load env vars
dotenv.config({path: './config/config/env'});

// Load models
const Bootcamp = require('./models/Bootcamp');

// Connect to DB
const config = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(process.env.MONGO_URI, config);

// Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

// Import into DB
const importData = async () => {
    try {
        console.log('connection:', mongoose.connection.readyState);
        await Bootcamp.create(bootcamps);
        console.log('Dummy Data Imported...'.green.inverse);
        process.exit();
    } catch(err) {
        console.log('Error With Import of Dummy Data');
        console.error(err);
    }
}

// Delete Data from DB
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        console.log('Dummy Data Deleted...'.red.inverse);
        process.exit();
    } catch(err) {
        console.log('Error With Delete of Dummy Data');
        console.error(err);
    }
}


// CLI command: node seeder -i or -d .... note that flags are [2] of the arg variables 
if(process.argv[2] === '-i'){
    importData();
} else if (process.argv[2] === '-d'){
    deleteData();
}