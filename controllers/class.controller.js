const ClassModel = require('../models/class.model');
const MentorModel = require('../')

module.exports = {
    get: async (req,res) => {
        const query = req.query || {};
        let classes;
        try{
            classes =  await ClassModel.find(query).populate({
                path: 'mentor_id teacher_id',
                populate: {
                    path: 'user_id', 
                    select: 'first_name last_name date_of_birth gender email'
                }
            })
        }catch(err) {
            return res.status(201).json({error: err});
        }
        return res.json(classes);
    },
    post: async (req,res) => {
        let timetables = [];
        if(req.body.session >= 2){
            for(var i = 0; i < req.body.session; i++){
                var session = {
                    start:{
                        hour: req.body.start_hour[i],
                        minute: req.body.start_minute[i]
                    },
                    end:{
                        hour: req.body.end_hour[i],
                        minute: req.body.end_minute[i]
                    },
                    day: req.body.day[i]
                }
                timetables.push(session);
            }
        }else{
            var session = {
                start:{
                    hour: req.body.start_hour,
                    minute: req.body.start_minute
                },
                end:{
                    hour: req.body.end_hour,
                    minute: req.body.end_minute
                },
                day: req.body.day
            }
            timetables.push(session);
        }
        let newClass = new ClassModel({
            class_name: req.body.class_name,
            teacher_id: req.body.teacher_id,
            grade: req.body.grade,
            mentor_id: req.body.mentor_id,
            timetables: timetables,
            student_ids: []
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
        if(req.body.start && req.body.end && req.body.day){
            let timetables;
            for(var i = 0; i < req.body.session; i++){
                var session = {
                    start: req.body.start[i],
                    end: req.body.end[i],
                    day: req.body.day[i]
                }
                timetables.push(session);
            }
        }
        try{
            if(req.body.class_name) matchedClass.class_name = req.body.class_name;
            if(req.body.teacher) matchedClass.teacher = req.body.teacher;
            if(req.body.grade) matchedClass.grade = req.body.grade;
            if(req.body.mentor) matchedClass.mentor = req.body.mentor;
            if(req.body.start && req.body.end && req.body.day) matchedClass.timetables = timetables;
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
    addStudent: async (req,res) => {
        let matchedClass;
        try{
            matchedClass = await ClassModel.findById(req.params.id)
        }catch(err){
            return res.status(201).json({error:err})
        }
        if(req.body.student_id){
            try{
                matchedClass.student_ids.push(req.body.student_id);
                matchedClass.save();
            }catch(err){
                return res.status(201).json({error:err})
            }
        }
        return res.json(matchedClass);
    },
    deleteStudent: async (req,res) => {
        let matchedClass;
        try{
            matchedClass = await ClassModel.findById(req.params.classId)
        }catch(err){
            return res.status(201).json({error:err})
        };
        const index = matchedClass.student_ids.indexOf(req.params.studentId);
        if(index > -1){
            matchedClass.student_ids.splice(index,1);
        }
        matchedClass.save();
        return res.json(matchedClass)
    },
    query: async (req,res) => {
        var mentor_id = req.query.mentor;
        var class_id = req.query.id;
        let mentorClass;
        let classes;
        let matchedClass;
        if(mentor_id){
            try{
                classes = await ClassModel.find({}).populate({
                    path: 'mentor_id teacher_id',
                    populate: {
                        path: 'user_id', 
                        select: 'first_name last_name date_of_birth gender email'
                    }
                });
                mentorClass = await ClassModel.find({mentor_id:mentor_id});
            }catch(err){
                return res.status(201).json({error:err})
            }
            return res.json({classes: classes, mentorClass: mentorClass})
        };
        if(class_id){
            try{
                matchedClass = await ClassModel.findById(class_id).populate({
                    path: 'mentor_id teacher_id',
                    populate: {
                        path: 'user_id', 
                        select: 'first_name last_name date_of_birth gender email'
                    }
                })
            }catch(err){
                return res.status(404).json({error:err})
            }
            return res.json(matchedClass)
        }
    }
}
