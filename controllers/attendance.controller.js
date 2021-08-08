const AttendanceModel = require('../models/attendance.model');
const StudentModel = require('../models/student.model');
const ClassModel = require('../models/class.model');

// TIME TO MILISECONDS
function timeToMs(timeString) {
    var timeArray = timeString.split(":")
    return parseInt(timeArray[0])* 3600000 + parseInt(timeArray[1])* 60000 + parseInt(timeArray[2])*1000
}

// MILISECONDS TO TIME
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
    //========================================================= NFC,QR URL TO CONFIRM ATTENDANCE ===================================================//
    get: async (req,res) => {
        // IP ADDRESS FOR CONFIRMING ATTENDANCE
        const properIp = '...'; // Required Ip Address
        // if(req.socket.remoteAddress !== properIp){
        //     return res.json({message:"Nghi vấn gian lận"})
        // }
        let suggestedClass;
        let student;
        let matchedClass;
        try{
            student = await StudentModel.findById(req.params.id).lean().populate({
                path: 'userId listClass',
                select: 'firstName lastName fullName date_of_birth gender email timetable grade className',
                populate: {
                    path: 'teacherId mentorId',
                    populate:{
                        path: 'userId',
                        select: 'firstName lastName fullName date_of_birth gender email'
                    } 
                }
            })
            student.userId._id = undefined;
            student = {...student.userId,...student};
            student.userId = undefined; 
            student.__v = undefined;
        }catch(err){
            return res.status(201).json({error:err})
        }
        if(student){
            if(student.userId)
            student.userId.password = undefined;
        }
        var currentDate = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
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
            countedTime = (currentDate.getHours() + 1) + ':' + (currentDate.getMinutes() - 30) + ':' + currentDate.getSeconds();
        }else{
            countedTime = currentDate.getHours() + ':' + (currentDate.getMinutes() + 30) + ':' + currentDate.getSeconds();
        }
        // START TIME - 30 MINS < CURRENT TIME < END TIME
        try{
            matchedClass = await ClassModel.find({
                $and: [
                    {"timetable.startTime": {$lte: countedTime}},
                    {"timetable.endTime": {$gte: currentTime}},
                    {"timetable.schedule": currentWeekday}
                ],
                grade: student.grade,
                _id: {$in: student.listClass}
            });
        }catch(err){
            return res.status(201).json({error:err})
        }
        // QUERIED MULTIPLE CLASSES AT THE SAME TIME
        if(matchedClass.length >= 2){
            // GIVING PREDICTION (CAN RECHOOSE IF NOT TRUE)
                predictedClass = matchedClass.find((item) => {
                    var startTimeMs = timeToMs(item.timetable.startTime)
                    var currentTimeMs = timeToMs(currentTime)
                    // PRIOR CLASS THAT ITS START TIME IN RANGE OF 30 MINS EARLIER AND 30 MINS LATER
                        return currentTimeMs >= startTimeMs - (30*60000) && currentTimeMs <= startTimeMs + (30*60000)
                })
                student.listClass = undefined;
                if(predictedClass){
                    return res.json({student:student, predictedClass: predictedClass, allClass: matchedClass})
                }
            return res.json({student: student,message:"More Than 1 Class Found", class: matchedClass})
        }
        if(matchedClass.length == 0){
            let classIds = [];
            let nearPastAttendance;
            let absencedClass = [];
            let availableClasses;
            const thisWeek = new Date(Date.now() - (currentWeekday - 1) * 24 * 60 * 60 * 1000 - timeToMs(currentTime))
            // ------------------ GIVING MAKE UP CLASS PREDICTION ------------------- //
            // QUERY AVAILABLE CLASS AT THE MOMENT
            availableClasses = await ClassModel.find({
                $and: [
                    {"timetable.startTime": {$lte: countedTime}},
                    {"timetable.endTime": {$gte: currentTime}},
                    {"timetable.schedule": currentWeekday}
                ],
                grade: student.grade
            }).lean();
            // PUSH ALL STUDENT'S CLASS IDS TO AN ARRAY
            for(var eachClass of student.listClass){
                classIds.push(eachClass._id)
            }
            // QUERY ATTENDANCE FORM THE BEGINING OF THE WEEK 
            nearPastAttendance = await AttendanceModel.find({
                time: {$gte: thisWeek},
                studentId: req.params.id // STUDENT'S ID
            }).lean()
            // DELETE EXIST CLASS IDS THAT ALREADY HAVE ATTENDANCE
            for(var attendance of nearPastAttendance){
                var index = classIds.indexOf(attendance)
                if (index > -1) {
                    array.splice(index, 1);
                }
            }
            // QUERY 
            absencedClass = await ClassModel.find({_id: {$in: classIds}}).lean()
            var priorAbsencedClass = absencedClass.sort((a,b) => {
                return a.timetable.schedule - b.timetable.schedule;
            })
            // FIND BASE ON SUBJECT, GRADE AND CLASSTIME
            var predictedMakeUpClass = availableClasses.find((item) => {
                return item.subjectName == priorAbsencedClass[0].subjectName && timeToMs(item.timetable.startTime) - timeToMs(item.timetable.startTime) == (timeToMs(priorAbsencedClass[0].timetable.startTime) - timeToMs(priorAbsencedClass[0].timetable.startTime))
            })
            student.listClass = undefined;
            if(predictedMakeUpClass) {predictedMakeUpClass.__v = undefined;}
            return res.json({student: student, predictedClass: predictedMakeUpClass, availableClasses: availableClasses})
        }
        student.listClass = undefined;
        return res.json({student:student, classes: matchedClass})
    },
    //==================================================== AUTOMATICALLY CREATE ATTENDANCE RECORD =================================================//
    post: (req,res) => {
        var attendance = new AttendanceModel({
            studentId: req.params.studentId,
            classId: req.params.classId,
        })
        try{
            attendance.save();
        }catch(err){
            res.status(201).json({error:err});
        }
        res.json("Successfully")
    },
    //========================================================= DELETE ATTENDANCE RECORD (EDIT TO ABSENCE) ===================================================//
    delete: async (req,res) => {
        try{
            await AttendanceModel.findByIdAndDelete(req.params.id);
        }catch(err){
            return res.status(201).json({error:err});
        }
        return res.json({result:"deleted successfully"})
    }
}