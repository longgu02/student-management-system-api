const TeacherModel = require('../models/teacher.model');
const UserModel = require('../models/user.model');

module.exports = {
    get: async (req,res) => {
        let teachers;
        let teachersQueried;
        const query = req.query || {};
        try{
            teachersQueried = await TeacherModel.find(query).lean().populate({
                    path: 'user_id',
                    select: 'firstName lastName fullName date_of_birth gender email'
            });
            teachers = teachersQueried.map((teacher) => {
                teacher.user_id._id = undefined;                
                teacherTransform = {...teacher.user_id,...teacher};
                teacherTransform.user_id = undefined;
                return teacherTransform;
            })
        }catch(err) {
            return res.status(201).json({error:err})
        };
        return res.json(teachers)
    },
    post: async (req,res) => {
        var matchedUser = await UserModel.findById(req.params.id);
        if(matchedUser.role !== "TEACHER"){
            return res.status(201).json({error: "User's role is not TEACHER"})
        }
        var newTeacher = new TeacherModel({
            user_id: req.params.id,
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
    delete: async (req,res) => {
        try{
            await TeacherModel.findById(req.params.id, null, async (err, teacher) => {
                if(err || !teacher) throw "Teacher Not Found"
                await UserModel.findByIdAndDelete(teacher.user_id)
                teacher.remove()
            })
        }catch(err){
            res.status(201).json({error:err})
        }
        return res.json("deleted successfully")
    }
}