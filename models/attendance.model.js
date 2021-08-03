const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    studentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    time:{
        type: Date,
        default: Date.now
    },
    classId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }, 
    note:{
        type: String
    }
})

module.exports = mongoose.model('Attendance', attendanceSchema);