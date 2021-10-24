const mongoose = require('mongoose');
const colors = require('colors');

const CourseSchema = new mongoose.Schema( {
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a Course Title ']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
    },
    tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
    type: Boolean,
    default: false
    },
    createdAt: {
    type: Date,
    default: Date.now
    },
    bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
    },
    user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
    }
});

// Static function that calculates the avg cost of tuition at each bootcamp
CourseSchema.statics.getAvgCost = async function(bootcampId){
    // console.log('Calcuating Avg Cost....'.blue);

    const objArray = await this.aggregate([
        {
            $match: {bootcamp: bootcampId}
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition'}
            }
        }
    ]);
    console.log(objArray);

    // Update Avg Cost Attribure of the Bootcamp in the Bootcamps Collections Table
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
            averageCost: Math.ceil(objArray[0].averageCost/10)*10,
        });
    } catch(err) {
       console.error(err); 
    }
}

// Call getAvgCost() after every save
CourseSchema.post('save', function(){
    this.constructor.getAvgCost(this.bootcamp);
});
// Call getAvgCost() Before every Remove
CourseSchema.post('remove', function(){
  this.constructor.getAvgCost(this.bootcamp);  
});

module.exports = mongoose.model('Course', CourseSchema);