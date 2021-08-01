const AttendanceModel = require('../models/attendance.model');
const StudentModel = require('../models/student.model');
const ClassModel = require('../models/class.model');

function timeToMs(timeString) {
    var timeArray = timeString.split(":")
    return parseInt(timeArray[0])* 3600000 + parseInt(timeArray[1])* 60000 + parseInt(timeArray[2])*1000
}
function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
  
    return hrs + ':' + mins + ':' + secs;
  }

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
            student = await StudentModel.findById(req.params.id).lean().populate({
                path: 'user_id listClass',
                select: 'firstName lastName fullName date_of_birth gender email timetable grade className',
                populate: {
                    path: 'teacher_id mentor_id',
                    populate:{
                        path: 'user_id',
                        select: 'firstName lastName fullName date_of_birth gender email'
                    } 
                }
            }) 
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
        var currentTime = currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();
        let countedTime;
        if(currentDate.getMinutes() >= 30){
            countedTime = currentDate.getHours() + ':' + (currentDate.getMinutes() + 30) + ':' + currentDate.getSeconds();
        }else{
            countedTime = (currentDate.getHours() + 1) + ':' + (currentDate.getMinutes() - 30) + ':' + currentDate.getSeconds();
        }
        // Giờ bắt đầu - 30 phút < thời gian hiện tại < giờ kết thúc
        try{
            matchedClass = await ClassModel.find({
                $and: [
                    {"timetable.startTime": {$lte: countedTime}},
                    {"timetable.endTime": {$gte: currentTime}},
                    {"timetable.schedule": currentWeekDay}
                ],
                grade: student.grade,
                _id: {$in: student.listClass}
            });
        }catch(err){
            return res.status(201).json({error:err})
        }
        // Trùng giờ nhiều lớp
        if(matchedClass.length >= 2 && typeof(matchedClass) == "array"){
            // Đưa ra dự báo lớp gần nhất (nếu không đúng thì có options chọn lại)
                predictedClass = matchedClass.find((item) => {
                    var startTimeMs = timeToMs(item.timetable.startTime)
                    var currentTimeMs = timeToMs(item.timetable.currentTime)
                    // Ưu tiên lớp có thời gian bắt đầu trong khoảng sớm hoặc muộn 30p so với thời gian hiện tại
                        return currentTimeMs >= startTimeMs - (30*60000) && currentTimeMs <= startTimeMs + (30*60000)
                })
                if(predictedClass){
                    return res.json({student:student, predictedClass: predictedClass, allClass: matchedClass})
                }
            return res.json({student: student,message:"More Than 1 Class Found", class: matchedClass})
        }
        if(!matchedClass){
            let classIds = [];
            let nearPastAttendance;
            let allPredictedClass = [];
            const thisWeek = new Date(Date.now() - (currentWeekDay - 1) * 24 * 60 * 60 * 1000 - timeToMs(item.timetable.currentTime))
            // Dự đoán lớp học bù
            availableClass = await ClassModel.find({
                $and: [
                    {"timetable.startTime": {$lte: countedTime}},
                    {"timetable.endTime": {$gte: currentTime}},
                    {"timetable.schedule": currentWeekDay}
                ],
                grade: student.grade
            });
            for(var eachClass of student.listClass){
                classIds.push(eachClass._id)
            }
            nearPastAttendance = await AttendanceModel.find({
                time: {$gte: weekAgo},
            })
            for(var attendance of nearPastAttendance){
                var index = classIds.indexOf(attendance)
                if (index > -1) {
                    array.splice(index, 1);
                }
            }
            allPredictedClass = await ClassModel.find({_id: {$in: classIds}}).lean()
            allPredictedClass = allPredictedClass.sort((a,b) => {
                return a.timetable.schedule - b.timetable.schedule;
            })
            return res.json({student: student, predictedClass = allPredictedClass[0], allPredictedClass = allPredictedClass})
        }
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