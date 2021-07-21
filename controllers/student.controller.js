const StudentModel = require('../models/student.model');
const UserModel = require('../models/user.model');

module.exports = {
    get: async (req,res) => {
        let students;
        const query = req.query || {};
        try{
            students = await StudentModel.find(query).populate('user_id')
        }catch(err){
            return res.status(201).json({error:err})
        }
        if(students){
            for(let student of students){
                if(student.user_id)
                student.user_id.password = undefined;
            }
        }
        return res.json(students);
    },
    post: async (req,res) => {
        // Còn trường hợp vừa là học sinh vừa là trợ giảng
        var matchedUser = await UserModel.findById(req.params.id);
        if(matchedUser.role !== "STUDENT"){
            return res.status(201).json({error: "User's role is not STUDENT"})
        }
        var newStudent = new StudentModel({
            school_name: req.body.school_name,
            grade: req.body.grade,
            user_id: req.params.id
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
        try{
            if(req.body.school_name) {student.school_name = req.body.school_name};
            if(req.body.grade) {student.grade = req.body.grade};
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