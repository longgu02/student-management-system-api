const TeacherModel = require('../models/teacher.model');
const UserModel = require('../models/user.model');

module.exports = {
    //========================================================= GET TEACHERS, OR LOW LEVEL QUERY ===================================================//
    get: async (req,res) => {
        let teachers;
        let teachersQueried;
        const query = req.query || {};
        try{
            teachersQueried = await TeacherModel.find(query).lean().populate({
                    path: 'userId',
                    select: 'firstName lastName fullName date_of_birth gender email'
            });
            //JSON BEAUTIFY
            teachers = teachersQueried.map((teacher) => {
                teacher.userId._id = undefined;                
                teacherTransform = {...teacher.userId,...teacher};
                teacherTransform.userId = undefined;
                return teacherTransform;
            })
        }catch(err) {
            return res.status(201).json({error:err})
        };
        return res.json(teachers)
    },
    //========================================================= CREATE TEACHER ===================================================//
    post: async (req,res) => {
        var matchedUser = await UserModel.findById(req.params.id);
        // ROLE VALIDATION
        if(matchedUser.role !== "TEACHER"){
            return res.status(201).json({error: "User's role is not TEACHER"})
        }
        var newTeacher = new TeacherModel({
            userId: req.params.id,
            exp: req.body.exp,
            subjectName: req.body.subjectName
        })
        try{
            newTeacher.save();
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(newTeacher)
    },
    //========================================================= EDIT TEACHER'S INFORMATION ===================================================//
    put: async (req,res) => {
        let teacher;
        try{
            teacher = await TeacherModel.findById(req.params.id);
            if(!teacher) throw "Teacher Not Found"
        }catch(err){
            return res.status(404).json({error:err});
        };
        try{
            if(req.body.exp) {teacher.exp = req.body.exp};
            if(req.body.subjectName) {teacher.subjectName = req.body.subjectName};
            teacher.save();
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(teacher);
    },
    //========================================================= DELETE TEACHER ===================================================//
    delete: async (req,res) => {
        try{
            await TeacherModel.findById(req.params.id, null, async (err, teacher) => {
                if(err || !teacher) throw "Teacher Not Found"
                await UserModel.findByIdAndDelete(teacher.userId)
                teacher.remove()
            })
        }catch(err){
            res.status(201).json({error:err})
        }
        return res.json({result:"deleted successfully"})
    }
}