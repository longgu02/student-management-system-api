const ClassModel = require('../models/class.model');
const StudentModel = require('../models/student.model');
const AttendanceModel = require('../models/attendance.model')
const RecordModel = require('../models/record.model')

module.exports = {
    //========================================================= GET CLASSES, OR LOW LEVEL QUERY ===================================================//
    get: async (req,res) => {
        const query = req.query || {};
        let classes;
        let classQueried
        try{
            classQueried =  await ClassModel.find(query).lean().populate({
                path: 'mentorId teacherId',
                populate: {
                    path: 'userId', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            })
            //JSON BEAUTIFY
            classes = classQueried.map((item) => {
                if(item.teacherId){
                    item.teacherId = {...item.teacherId.userId,...item.teacherId}
                    item.teacherId.userId = undefined
                    item.teacherId._id = undefined 
                    item.teacherId.__v = undefined
                    if(item.mentorId){
                        item.mentorId = {...item.mentorId.userId,...item.mentorId}
                        item.mentorId._id = undefined
                        item.mentorId.__v = undefined
                        item.mentorId.userId = undefined
                    }
                }
                    return item
            })
        }catch(err) {
            return res.status(201).json({error: err});
        }
        return res.json(classes);
    },
    //========================================================= CREATE NEW CLASS ===================================================//
    post: async (req,res) => {
        let newClass = new ClassModel({
            className: req.body.className,
            teacherId: req.body.teacherId,
            subjectName: req.body.subjectName,
            grade: req.body.grade,
            mentorId: req.body.mentorId,
            timetable: {
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                schedule: req.body.schedule
            }
        })
        try{
            await newClass.save();
        }catch(err){
            return res.status(201).json({error:err});
        }
        return res.json(newClass)
    },
    //========================================================= EDIT CLASS'S INFORMATION ===================================================//
    put: async (req,res) => {
        let matchedClass;
        try{
            matchedClass = await ClassModel.findById(req.params.classId);
            if(!matchedClass) throw "Class Not Found";
        }catch(err){
            return res.status(404).json({error:err})
        }
        try{
            if(req.body.className) {matchedClass.className = req.body.className};
            if(req.body.teacher) {matchedClass.teacher = req.body.teacher};
            if(req.body.grade) {matchedClass.grade = req.body.grade};
            if(req.body.mentor) {matchedClass.mentor = req.body.mentor};
            if(req.body.startTime && req.body.endTime && req.body.schedule) {
                matchedClass.timetable = {
                    startTime: {
                        hour: req.body.startTime_hour,
                        minute: req.body.startTime_minute
                    },
                    endTime: {
                        hour: req.body.endTime_hour,
                        minute: req.body.endTime_minute
                    },
                    schedule: req.body.schedule
                }
            };
            await matchedClass.save();
        } catch (err) {
            return res.status(201).json({error:err});
        }
        return res.json({matchedClass});
    },
    //========================================================= DELETE CLASS ==========================================================//
    delete: async (req,res) => {
        try{
            await ClassModel.findByIdAndDelete(req.params.classId)
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json({result:"deleted successfully"})
    },
    //========================================================= HIGHER LEVEL QUERY ===================================================//
    // query: async (req,res) => {
    //     let mentorClass;
    //     let classes;
    //     let matchedClass;
    //     if(mentorId)
    // },
    //========================================================= GET 1 CLASS (VIEW) ===================================================//
    classView: async (req,res) => {
        let classView;
        let studentIds;
        let makeUpAttendances;
        let studentTransform;
        let attendances;
        let listStudent;
        let queriedAttendances;
        let classRecords;
        // CLASS QUERY
        try{
            classView = await ClassModel.findById(req.params.id).lean().populate({
                path: 'mentorId teacherId',
                populate: {
                    path: 'userId', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            });
            // JSON BEAUTIFY
            if(!classView){return res.status(400).json("Class Not Found")}
                if(classView.teacherId){
                    classView.teacherId = {...classView.teacherId.userId,...classView.teacherId}
                    classView.teacherId.userId = undefined
                    classView.teacherId._id = undefined 
                    classView.teacherId.__v = undefined
                    if(classView.mentorId){
                        classView.mentorId = {...classView.mentorId.userId,...classView.mentorId}
                        classView.mentorId._id = undefined
                        classView.mentorId.__v = undefined
                        classView.mentorId.userId = undefined
                    }
                }  
        }catch(err){
           return res.status(400).json({error:err}) 
        }
        // STUDENT IN CLASS QUERY
        try{
            studentIds = await StudentModel.find({
                listClass: classView._id
            }).lean().populate({
                path: 'userId',
                select: 'firstName lastName fullName date_of_birth gender email'
            }).select('grade status parentPhone parentName studentPhone')
            //JSON BEAUTIFY
            listStudent = studentIds.map((item) => {
                item.userId._id = undefined;
                studentTransform = {...item.userId,...item};
                studentTransform.userId = undefined;
    
                return studentTransform;
            })
        }catch(err){
            return res.status(201).json({error: err})
        }
        // CLASS RECORD 
        try{
            classRecords = await RecordModel.find({
                classId: req.params.id
            })
        }catch(err){
            return res.status(201).json({error: err})
        }
        // ATTENDANCE OF STUDENT IN CLASS 
        try{
            queriedAttendances = await AttendanceModel.find({
                classId: req.params.id,
            }).lean().populate({
                path: 'studentId',
                populate: {
                    path: 'userId', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            })
            makeUpAttendances = queriedAttendances.filter((attendance) => {
                return attendance.studentId.listClass.indexOf(req.params.id) === -1;
            })
            attendances = queriedAttendances.filter((attendance) => {
                return attendance.studentId.listClass.indexOf(req.params.id) !== -1;
            })
        }catch(err){
            return res.status(201).json({error: err})
        };
        makeUpAttendances = makeUpAttendances.map((attendance) => {
            attendance.studentId = {...attendance.studentId,...attendance.studentId.userId}
            attendance.studentId.userId = undefined;
            attendance.studentId.__v = undefined;
            return attendance;
        });
        attendances = attendances.map((attendance) => {
            attendance.studentId = {...attendance.studentId,...attendance.studentId.userId}
            attendance.studentId.userId = undefined;
            attendance.studentId.__v = undefined;
            return attendance;
        });
        return res.json({
            class: classView,
            listStudent: listStudent,
            attendance: attendance,
            makeUpAttendances: makeUpAttendances,
            classRecords: classRecords
        })
    }, 
    //========================================================= ADD STUDENT TO CLASS ===================================================//
    addStudent: async (req,res) => {
        let student;
        let studentIds = req.body.studentId
        // 2 OR MORE STUDENT IDS
        if(studentIds.length >= 2 && Array.isArray(studentIds)){
            for(var studentId of studentIds){
                try{
                    student = await StudentModel.findById(studentId)
                    if(!student) throw "Student Not Found";
                    if(student.listClass.indexOf(req.params.id) == -1){
                        student.listClass.push(req.params.id);
                    }
                    student.save() 
                }catch(err){
                    return res.status(201).json({error:err})
                }
            }
        }else{ // 1 STUDENT ID
            try{
                student = await StudentModel.findById(req.body.studentId);
                if(!student) throw "Student Not Found";
                if(student.listClass.indexOf(req.params.id) == -1){
                    student.listClass.push(req.params.id);
                }
                student.save() 
            }catch(err){
                return res.status(201).json({error:err})
            }
        }
        return res.json({result:"added successfully"})
    },
    //========================================================= REMOVE STUDENT FROM CLASS ===================================================//
    removeStudent: async (req,res) => {
        let student;
        let studentIds = req.body.studentId
        // 2 OR MORE STUDENT IDS
        if(studentIds.length >= 2 && typeof(studentIds) == "array"){
            for(var studentId of studentIds){
                try{
                    student = await StudentModel.findById(studentId);
                    if(!student) throw "Student Not Found";
                    var index = student.listClass.indexOf(req.params.id);
                    if (index > -1) {
                      student.listClass.splice(index, 1);
                    }
                    student.save() 
                }catch(err){
                    return res.status(201).json({error:err})
                }
            }
        }else{ // 1 STUDENT ID
            try{
                student = await StudentModel.findById(studentId);
                if(!student) throw "Student Not Found";
                var index = student.listClass.indexOf(req.params.id);
                if (index > -1) {
                  student.listClass.splice(index, 1);
                }
                student.save() 
            }catch(err){
                return res.status(201).json({error:err})
            }
        }
        return res.json({result:"remove successfully"})
    },
    //========================================================= GET CLASSES VIA GRADE- ===================================================//
    queryGrade: async (req,res) => {
        const grade = req.params.grade;
        let classes;
        let classQueried;
        try{
            classQueried = await ClassModel.find({grade: grade}).lean().populate({
                path: 'mentorId teacherId',
                populate: {
                    path: 'userId', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            })
            // JSON BEAUTIFY
            classes = classQueried.map((item) => {
                if(item.teacherId){
                    item.teacherId = {...item.teacherId.userId,...item.teacherId}
                    item.teacherId.userId = undefined
                    item.teacherId._id = undefined 
                    item.teacherId.__v = undefined
                    if(item.mentorId){
                        item.mentorId = {...item.mentorId.userId,...item.mentorId}
                        item.mentorId._id = undefined
                        item.mentorId.__v = undefined
                        item.mentorId.userId = undefined
                    }
                }
                    return item
            })
        }catch(err) {
            return res.status(201).json({error: err});
        }
        res.json(classes)
    },
    //========================================================= GET ATTENDANCE OF CLASS ===================================================//
    getAttendance: async (req,res) => {
        let attendances;
        let queriedAttendances
        try{
            queriedAttendances = await AttendanceModel.find({
                classId: req.params.id,
            }).lean().populate({
                path: 'studentId',
                populate: {
                    path: 'userId', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            })
            attendances = queriedAttendances.filter((attendance) => {
                return attendance.studentId.listClass.indexOf(req.params.id) !== -1;
            })
        }catch(err){
            return res.status(201).json({error: err})
        }
        attendances = attendances.map((attendance) => {
            attendance.studentId = {...attendance.studentId,...attendance.studentId.userId}
            attendance.studentId.userId = undefined;
            attendance.studentId.__v = undefined;
            return attendance;
        })
        return res.json(attendances)
    },
    //========================================================= GET MAKE UP ATTENDANCE OF CLASS ===================================================//
    getMakeUpAttendance: async (req,res) => {
        let makeUpAttendances;
        let attendances
        try{
            attendances = await AttendanceModel.find({
                classId: req.params.id,
            }).lean().populate({
                path: 'studentId',
                populate: {
                    path: 'userId', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            })
            makeUpAttendances = attendances.filter((attendance) => {
                return attendance.studentId.listClass.indexOf(req.params.id) === -1;
            })
        }catch(err){
            return res.status(201).json({error: err})
        }
        makeUpAttendances = makeUpAttendances.map((attendance) => {
            attendance.studentId = {...attendance.studentId,...attendance.studentId.userId}
            attendance.studentId.userId = undefined;
            attendance.studentId.__v = undefined;
            return attendance;
        })
        return res.json(makeUpAttendances)
    }
}
