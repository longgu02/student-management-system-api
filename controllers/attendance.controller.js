const AttendanceModel = require('../models/attendance.model');
const StudentModel = require('../models/student.model');
const ClassModel = require('../models/class.model');


module.exports = {
    get: async (req,res) => {
        const properIp = '...'; // Required Ip Address
        // if(req.socket.remoteAddress !== properIp){
        //     return res.json({message:"Nghi vấn gian lận"})
        // }
        let suggestedClass;
        let student;
        let matchedClass;
        try{
            student = await StudentModel.findById(req.params.id).populate('user_id') 
        }catch(err){
            return res.status(201).json({error:err})
        }
        if(student){
            if(student.user_id)
            student.user_id.password = undefined;
        }
        var currentDate = new Date();
        var weekday = new Array(7);
        weekday[0] = 8;
        weekday[1] = 2;
        weekday[2] = 3;
        weekday[3] = 4;
        weekday[4] = 5;
        weekday[5] = 6;
        weekday[6] = 7;
        var currentWeekday = weekday[currentDate.getDay()];
        var currentHours = currentDate.getHours();
        var currentMinutes = currentDate.getMinutes();
        // var currentTime = currentHours + ':' + currentMinutes;
        try{
            matchedClass = await ClassModel.find({
                $or: [{
                    $and: [{
                    "timetables.0.day": currentWeekday,
                    $or: [
                        {"timetables.0.start.hour": {$lte: currentHours}},
                        {$and: [{"timetables.0.start.hour": currentHours}, {"timetables.0.start.minute": {$lte: currentMinutes}}]}
                    ],
                    $or: [
                        {"timetables.0.end.hour": {$gte: currentHours}},
                        {$and: [{"timetables.0.end.hour": currentHours}, {"timetables.0.end.minute": {$gte: currentMinutes}}]}
                    ],
                    "grade": student.grade
                    }]
                },{
                    $and: [{
                    "timetables.1.day": currentWeekday,
                    $or: [
                        {"timetables.1.start.hour": {$lte: currentHours}},
                        {$and: [{"timetables.1.start.hour": currentHours}, {"timetables.1.start.minute": {$lte: currentMinutes}}]}
                    ],
                    $or: [
                        {"timetables.1.end.hour": {$gte: currentHours}},
                        {$and: [{"timetables.1.end.hour": currentHours}, {"timetables.1.end.minute": {$gte: currentMinutes}}]}
                    ],
                    "grade": student.grade
                    }]
                },{
                    $and: [{
                    "timetables.2.day": currentWeekday,
                    $or: [
                        {"timetables.2.start.hour": {$lte: currentHours}},
                        {$and: [{"timetables.2.start.hour": currentHours}, {"timetables.2.start.minute": {$lte: currentMinutes}}]}
                    ],
                    $or: [
                        {"timetables.2.end.hour": {$gte: currentHours}},
                        {$and: [{"timetables.2.end.hour": currentHours}, {"timetables.2.end.minute": {$gte: currentMinutes}}]}
                    ],
                    "grade": student.grade
                    }]
                },{
                    $and: [{
                    "timetables.3.day": currentWeekday,
                    $or: [
                        {"timetables.3.start.hour": {$lte: currentHours}},
                        {$and: [{"timetables.3.start.hour": currentHours}, {"timetables.3.start.minute": {$lte: currentMinutes}}]}
                    ],
                    $or: [
                        {"timetables.3.end.hour": {$gte: currentHours}},
                        {$and: [{"timetables.3.end.hour": currentHours}, {"timetables.3.end.minute": {$gte: currentMinutes}}]}
                    ],
                    "grade": student.grade
                    }]
                },{
                    $and: [{
                    "timetables.4.day": currentWeekday,
                    $or: [
                        {"timetables.4.start.hour": {$lte: currentHours}},
                        {$and: [{"timetables.1.start.hour": currentHours}, {"timetables.4.start.minute": {$lte: currentMinutes}}]}
                    ],
                    $or: [
                        {"timetables.4.end.hour": {$gte: currentHours}},
                        {$and: [{"timetables.4.end.hour": currentHours}, {"timetables.4.end.minute": {$gte: currentMinutes}}]}
                    ],
                    "grade": student.grade
                    }]
                }],
                student_ids: {$in: [student._id]}
            });
        }catch(err){
            return res.status(201).json({error:err})
        }
        // Trùng giờ nhiều lớp
        if(matchedClass.length >= 2){
            return res.json({student: student,message:"More Than 1 Class Found", class: matchedClass})
        }
        if(matchedClass){
            return res.json({student: student, matchedClass: matchedClass})
        }
        suggestedClass = await ClassModel.find({
            $or: [{
                $and: [{
                "timetables.0.day": currentWeekday,
                $or: [
                    {"timetables.0.start.hour": {$lte: currentHours}},
                    {$and: [{"timetables.0.start.hour": currentHours}, {"timetables.0.start.minute": {$lte: currentMinutes}}]}
                ],
                $or: [
                    {"timetables.0.end.hour": {$gte: currentHours}},
                    {$and: [{"timetables.0.end.hour": currentHours}, {"timetables.0.end.minute": {$gte: currentMinutes}}]}
                ],
                "grade": student.grade
                }]
            },{
                $and: [{
                "timetables.1.day": currentWeekday,
                $or: [
                    {"timetables.1.start.hour": {$lte: currentHours}},
                    {$and: [{"timetables.1.start.hour": currentHours}, {"timetables.1.start.minute": {$lte: currentMinutes}}]}
                ],
                $or: [
                    {"timetables.1.end.hour": {$gte: currentHours}},
                    {$and: [{"timetables.1.end.hour": currentHours}, {"timetables.1.end.minute": {$gte: currentMinutes}}]}
                ],
                "grade": student.grade
                }]
            },{
                $and: [{
                "timetables.2.day": currentWeekday,
                $or: [
                    {"timetables.2.start.hour": {$lte: currentHours}},
                    {$and: [{"timetables.2.start.hour": currentHours}, {"timetables.2.start.minute": {$lte: currentMinutes}}]}
                ],
                $or: [
                    {"timetables.2.end.hour": {$gte: currentHours}},
                    {$and: [{"timetables.2.end.hour": currentHours}, {"timetables.2.end.minute": {$gte: currentMinutes}}]}
                ],
                "grade": student.grade
                }]
            },{
                $and: [{
                "timetables.3.day": currentWeekday,
                $or: [
                    {"timetables.3.start.hour": {$lte: currentHours}},
                    {$and: [{"timetables.3.start.hour": currentHours}, {"timetables.3.start.minute": {$lte: currentMinutes}}]}
                ],
                $or: [
                    {"timetables.3.end.hour": {$gte: currentHours}},
                    {$and: [{"timetables.3.end.hour": currentHours}, {"timetables.3.end.minute": {$gte: currentMinutes}}]}
                ],
                "grade": student.grade
                }]
            },{
                $and: [{
                "timetables.4.day": currentWeekday,
                $or: [
                    {"timetables.4.start.hour": {$lte: currentHours}},
                    {$and: [{"timetables.1.start.hour": currentHours}, {"timetables.4.start.minute": {$lte: currentMinutes}}]}
                ],
                $or: [
                    {"timetables.4.end.hour": {$gte: currentHours}},
                    {$and: [{"timetables.4.end.hour": currentHours}, {"timetables.4.end.minute": {$gte: currentMinutes}}]}
                ],
                "grade": student.grade
                }]
            }]
        });
        return res.status(400).json({student:student, classes: matchedClass})
    },
    post: (req,res) => {
        var attendance = new AttendanceModel({
            student_id: req.params.studentId,
            class_id: req.params.classId,
        })
        try{
            attendance.save();
        }catch(err){
            res.status(201).json({error:err});
        }
        res.json("Successfully")
    },
    delete: async (req,res) => {
        try{
            await AttendanceModel.findByIdAndDelete(req.params.id);
        }catch(err){
            return res.status(201).json({error:err});
        }
        return res.json("Deleted Successfully")
    }
}