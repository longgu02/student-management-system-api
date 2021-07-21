const mongoose = require('mongoose');

const teacherSchema = mongoose.Schema({
    exp: {
        type: Number
    },
    subject: {
        type: String,
        enum: ['TOÁN', 'LÝ', 'HÓA', 'VĂN', 'ANH', 'SINH', 'SỬ', 'ĐỊA', 'GDCD']
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

module.exports = mongoose.model('Teacher', teacherSchema)