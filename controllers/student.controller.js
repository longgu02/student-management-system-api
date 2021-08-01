const StudentModel = require('../models/student.model');
const UserModel = require('../models/user.model');

module.exports = {
    get: async (req,res) => {
        let students;
        let studentsQueried
        let studentTransform
        const query = req.query || {};
        try{
            studentsQueried = await StudentModel.find(query).lean().populate({
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
        // JSON BEAUTIFY
        students = studentsQueried.map((student) => {
            student.user_id._id = undefined;
            if(student.listClass.length > 0){
                student.listClass.map((item) => {
                if(item.teacher_id){
                    item.teacher_id = {...item.teacher_id.user_id,...item.teacher_id}
                    item.mentor_id = {...item.mentor_id.user_id,...item.mentor_id}
                    item.teacher_id.user_id = undefined
                    item.mentor_id.user_id = undefined
                    item.teacher_id._id = undefined 
                    item.teacher_id.__v = undefined
                    if(item.mentor_id){
                        item.mentor_id._id = undefined
                        item.mentor_id.__v = undefined
                    }
                }
                    return item
            })}
            studentTransform = {...student.user_id,...student};
            studentTransform.user_id = undefined;

            return studentTransform;
        })
        // await StudentModel.find(query, null, async (err, student) => {
        //     if(err || !student) {return res.status(201).json({error:err})};
        //     user_id_populated = await UserModel.findById(student.user_id).select('firstName lastName fullName date_of_birth gender email');
        //     student.user_id = undefined;
        //     students = Object.assign(student, user_id_populated)
        // })
        return res.json(students);
    },
    post: async (req,res) => {
        // Còn trường hợp vừa là học sinh vừa là trợ giảng
        var matchedUser = await UserModel.findById(req.params.id);
        if(matchedUser.role !== "STUDENT"){
            return res.status(201).json({error: "User's role is not STUDENT"})
        }
        // Tạo 1 Array các lớp học sinh học
        let listClass = [];
        if(req.body.class_id){
            if(req.body.class_id.length >= 2 && typeof req.body.class_id !== 'string'){
                for(var c of req.body.class_id){
                    listClass.push(c);
                }
            }else{
                listClass.push(req.body.class_id)
            }
        }
        // Create new Student
        var newStudent = new StudentModel({
            school_name: req.body.school_name,
            grade: req.body.grade,
            user_id: req.params.id,
            status: "active",
            studentPhone: req.body.studentPhone,
            parentPhone: req.body.parentPhone,
            parentName: req.body.parentName,
            listClass: listClass
        })
        try{
            await newStudent.save();
        }catch(err){
            return res.status(201).json({error:err});
        }
        return res.json({newStudent});
    },
    put: async (req,res) => {
        let student;
        try{
            student = await StudentModel.findById(req.params.id);
            if(!student) throw "Student Not Found" 
        }catch(err){
            return res.status(201).json({error:err});
        }
        // Nếu xóa lớp thì cho req.body.class_id là những lớp k bị xóa hoặc thay đổi (gán value)
        var listClass = []
        if(req.body.class_id){
            if(req.body.class_id.length >= 2 && typeof req.body.class_id !== 'string'){
                for(var c of req.body.class_id){
                    listClass.push(c);
                }
            }else{
                listClass.push(req.body.class_id)
            }
        }
        try{
            if(req.body.school_name) {student.school_name = req.body.school_name};
            if(req.body.grade) {student.grade = req.body.grade};
            if(req.body.status) {student.status = req.body.status};
            if(req.body.studentPhone){student.studentPhone = req.body.studentPhone};
            if(req.body.parentPhone){student.parentPhone = req.body.parentPhone};
            if(req.body.parentName){student.parentName = req.body.parentName};
            if(req.body.class_id){student.listClass = listClass}
            await student.save()
        }catch(err){
            return res.status(201).json({error:err});
        }
        return res.json(student)
    },
    delete: async (req,res) => {
        try{
            await StudentModel.findById(req.params.id, null, async (err, student) => {
                if(err || !student) throw "Student Not Found"
                await UserModel.findByIdAndDelete(student.user_id)
                student.remove()
            })
        }catch(err){
            res.status(201).json({error:err})
        }
        return res.json("deleted successfully")
    }
}