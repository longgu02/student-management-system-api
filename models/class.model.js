const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
    class_name: {
        type: String,
        require: true
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        require: true
    },
    grade: {
        type: Number,
        enum: [1,2,3,4,5,6,7,8,9,10,11,12],
        require: true
    },
    mentor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor'
    },
    timetables: [{
        start:{
            hour: Number,
            minute: Number
        },
        end:{
            hour: Number,
            minute: Number
        },
        day: {
            type: Number,
            enum: [2,3,4,5,6,7,8]
        }
    }],
    student_ids:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
})

module.exports = mongoose.model('Class', classSchema);