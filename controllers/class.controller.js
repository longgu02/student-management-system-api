const ClassModel = require('../models/class.model');
const StudentModel = require('../models/student.model');
const AttendanceModel = require('../models/attendance.model')

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
        let student_ids;
        let attendance;
        let studentTransform;
        let listStudent
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
            student_ids = await StudentModel.find({
                listClass: classView._id
            }).lean().populate({
                path: 'userId',
                select: 'firstName lastName fullName date_of_birth gender email'
            }).select('grade status parentPhone parentName studentPhone')
            //JSON BEAUTIFY
            listStudent = student_ids.map((item) => {
                item.userId._id = undefined;
                studentTransform = {...item.userId,...item};
                studentTransform.userId = undefined;
    
                return studentTransform;
            })
        }catch(err){
            return res.status(201).json({error: err})
        }
        // ATTENDANCE OF STUDENT IN CLASS 
        try{
            attendance = await AttendanceModel.find({
                classId: classView._id
            })
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json({
            class: classView,
            listStudent: listStudent,
            attendance: attendance
        })
    }, 
    //========================================================= ADD STUDENT TO CLASS ===================================================//
    addStudent: async (req,res) => {
        let student;
        try{
            student = await StudentModel.findById(req.body.studentId)
            student.listClass.push(req.params.id);
            student.save() 
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json({result: "added successfully"})
    },
    //========================================================= REMOVE STUDENT FROM CLASS ===================================================//
    removeStudent: async (req,res) => {
        let student;
        try{
            student = await StudentModel.findById(req.params.studentId)
            const index = student.listClass.indexOf(req.params.classId);
            if (index > -1) {
              student.listClass.splice(index, 1);
            }
            student.save()
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json({result: "remove successfully"})
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
    attendanceView: async (req,res) => {
        let attendances;
        try{
            attendances = await AttendanceModel.find({classId: req.params.id}).lean().populate({
                path: 'student_id',
                populate: {
                    path: 'userId', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            })
        }catch(err){
            return res.status(201).json({error:err})
        }
        // JSON BEAUTIFY
        attendances = attendances.map((attendance) => {
            attendance.student_id = {...attendance.student_id,...attendance.student_id.userId}
            attendance.student_id.userId = undefined;
            attendance.student_id.__v = undefined;
            return attendance;
        })
        return res.json(attendances)
    }
}
