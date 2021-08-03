const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
    className: {
        type: String,
        require: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        require: true
    },
    subjectName:{
        type: String,
        enum: ['TOÁN', 'LÝ', 'HÓA', 'VĂN', 'ANH', 'SINH', 'SỬ', 'ĐỊA', 'GDCD']
    },
    grade: {
        type: Number,
        enum: [1,2,3,4,5,6,7,8,9,10,11,12],
        require: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
    },
    timetable:{
        startTime:{
            type: String
        },
        endTime:{
            type: String
        },
        schedule: {
            type: Number,
            enum: [2,3,4,5,6,7,8]
        }
    },
})

module.exports = mongoose.model('Class', classSchema);