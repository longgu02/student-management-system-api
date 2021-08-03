const mongoose = require('mongoose')

const studentRecordSchema = mongoose.Schema({
    recordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Record'
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    score: {
        type: Number,
    },
    note: {
        type: String,
    }
})

module.exports = mongoose.model('StudentRecord', studentRecordSchema)