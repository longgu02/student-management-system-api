const mongoose = require('mongoose')

const recordSchema = mongoose.Schema({
    name: {
        type: String
    },
    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date
    },
    note: {
        type: String
    }
})

module.exports = mongoose.model('Record', recordSchema)