const TeacherModel = require('../models/teacher.model');
const UserModel = require('../models/user.model');

module.exports = {
    get: async (req,res) => {
        let teachers;
        const query = req.query || {};
        try{
            teachers = await TeacherModel.find(query).populate('user_id');
        }catch(err) {
            return res.status(201).json({error:err})
        };
        if(teachers){
            for(var teacher of teachers){
                teacher.user_id.password = undefined;
            };
        }
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
            subject: req.body.subject
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
            if(req.body.subject) {teacher.subject = req.body.subject};
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