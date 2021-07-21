const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    school_name:{
        type: String
    },
    grade:{
        type: Number,
        enum: [1,2,3,4,5,6,7,8,9,10,11,12]
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Student', studentSchema)