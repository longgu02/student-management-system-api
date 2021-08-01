const ClassModel = require('../models/class.model');
const StudentModel = require('../models/student.model');
const AttendanceModel = require('../models/attendance.model')

module.exports = {
    get: async (req,res) => {
        const query = req.query || {};
        let classes;
        let classQueried
        try{
            classQueried =  await ClassModel.find(query).lean().populate({
                path: 'mentor_id teacher_id',
                populate: {
                    path: 'user_id', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            })
            classes = classQueried.map((item) => {
                if(item.teacher_id){
                    item.teacher_id = {...item.teacher_id.user_id,...item.teacher_id}
                    item.teacher_id.user_id = undefined
                    item.teacher_id._id = undefined 
                    item.teacher_id.__v = undefined
                    if(item.mentor_id){
                        item.mentor_id = {...item.mentor_id.user_id,...item.mentor_id}
                        item.mentor_id._id = undefined
                        item.mentor_id.__v = undefined
                        item.mentor_id.user_id = undefined
                    }
                }
                    return item
            })
        }catch(err) {
            return res.status(201).json({error: err});
        }
        return res.json(classQueried);
    },
    post: async (req,res) => {
        let newClass = new ClassModel({
            className: req.body.className,
            teacher_id: req.body.teacher_id,
            grade: req.body.grade,
            mentor_id: req.body.mentor_id,
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
    delete: async (req,res) => {
        try{
            await ClassModel.findByIdAndDelete(req.params.classId)
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json({result:"deleted successfully"})
    },
    // query: async (req,res) => {
    //     var mentor_id = req.query.mentor;
    //     var class_id = req.query.id;
    //     let mentorClass;
    //     let classes;
    //     let matchedClass;
    //     if(mentor_id){
    //         try{
    //             classes = await ClassModel.find().populate({
    //                 path: 'mentor_id teacher_id',
    //                 populate: {
    //                     path: 'user_id', 
    //                     select: 'firstName lastName fullName gender email'
    //                 }
    //             });
    //             mentorClass = await ClassModel.find({mentor_id:mentor_id});
    //         }catch(err){
    //             return res.status(201).json({error:err})
    //         }
    //         return res.json({classes: classes, mentorClass: mentorClass})
    //     };
    //     if(class_id){
    //         try{
    //             matchedClass = await ClassModel.findById(class_id).populate({
    //                 path: 'mentor_id teacher_id',
    //                 populate: {
    //                     path: 'user_id', 
    //                     select: 'firstName lastName fullName gender email'
    //                 }
    //             })
    //         }catch(err){
    //             return res.status(404).json({error:err})
    //         }
    //         return res.json(matchedClass)
    //     }
    // },
    classView: async (req,res) => {
        let matchedClass;
        let student_ids;
        let attendance;
        // CLASS QUERY
        try{
            matchedClass = await ClassModel.findById(req.params.id).populate({
                path: 'mentor_id teacher_id',
                populate: {
                    path: 'user_id', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            });
            if(!matchedClass){return res.status(400).json("Class Not Found")}
        }catch(err){
           return res.status(400).json({error:err}) 
        }
        // STUDENT IN CLASS QUERY
        try{
            student_ids = await StudentModel.find({
                class_ids: matchedClass._id
            }).populate({
                path: 'user_id',
                select: 'firstName lastName fullName date_of_birth gender email'
            })
        }catch(err){
            return res.status(201).json({error: err})
        }
        // ATTENDANCE OF STUDENT IN CLASS 
        try{
            attendance = await AttendanceModel.find({
                class_id: matchedClass._id
            })
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json({
            class: matchedClass,
            student_ids: student_ids,
            attendance: attendance
        })
    }, 
    addStudent: async (req,res) => {
        let student;
        try{
            student = await StudentModel.findById(req.body.id)
            student.class_ids.push(req.params.id) 
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json("added successfully")
    },
    removeStudent: async (req,res) => {
        let student;
        try{
            student = await StudentModel.findById(req.params.studentId)
            const index = student.class_ids.indexOf(req.params.classId);
            if (index > -1) {
              array.splice(index, 1);
            }
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json("remove successfully")
    },
    queryGrade: async (req,res) => {
        const grade = req.params.grade;
        let classes;
        let classQueried;
        try{
            classQueried = await ClassModel.find({grade: grade}).lean().populate({
                path: 'mentor_id teacher_id',
                populate: {
                    path: 'user_id', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            })
            classes = classQueried.map((item) => {
                if(item.teacher_id){
                    item.teacher_id = {...item.teacher_id.user_id,...item.teacher_id}
                    item.teacher_id.user_id = undefined
                    item.teacher_id._id = undefined 
                    item.teacher_id.__v = undefined
                    if(item.mentor_id){
                        item.mentor_id = {...item.mentor_id.user_id,...item.mentor_id}
                        item.mentor_id._id = undefined
                        item.mentor_id.__v = undefined
                        item.mentor_id.user_id = undefined
                    }
                }
                    return item
            })
        }catch(err) {
            return res.status(201).json({error: err});
        }
        res.json(classes)
    },
    attendanceView: (req,res) => {
        let attendances
        try{
            attendances = await AttendanceModel.find({class_id: req.params.id}).populate('student_id').lean()
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(attendances)
    }
}
