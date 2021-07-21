const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    student_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    time:{
        type: Date,
        default: Date.now
    },
    class_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }
})

module.exports = mongoose.model('Attendance', attendanceSchema);