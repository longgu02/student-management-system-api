const MentorModel = require('../models/mentor.model');
const UserModel = require('../models/user.model');
module.exports = {
    get: async (req,res) => {
        let mentors;
        let mentorsQueried
        var query = req.query || {};
        try{
            mentorsQueried = await MentorModel.find(query).lean().populate({
                path: 'user_id',
                select: 'firstName lastName fullName date_of_birth gender email'
        });
            mentors = mentorsQueried.map((mentor) => {
                mentor.user_id._id = undefined;                
                mentorTransform = {...mentor.user_id,...mentor};
                mentorTransform.user_id = undefined;
                return mentorTransform;
            }) 
        }catch(err){
            return res.status(201).json({error:err});
        }
        return res.json(mentors)
    },
    post: async (req,res) => {
        var matchedUser = await UserModel.findById(req.params.id);
        if(matchedUser.role !== "MENTOR"){
            return res.status(201).json({error: "User's role is not MENTOR"})
        }        
        var newMentor = new MentorModel({
            user_id: req.params.id,
            exp: req.body.exp,
            subjectName: req.body.subjectName
        });
        try{
            newMentor.save();
        }catch(error){
            return res.status(201).json({error:err})
        }
        return res.json(newMentor);
    },
    put: async (req,res) => {
        let mentor;
        try{
            mentor = await MentorModel.findById(req.params.id);
            if(!mentor) throw "Mentor Not Found"
        }catch(err){
            return res.status(404).json({error:err});
        };
        try{
            if(req.body.exp) {mentor.exp = req.body.exp};
            if(req.body.subjectName) {mentor.subjectName = req.body.subjectName};
            mentor.save();
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(mentor);
    },
    delete: async (req,res) => {
        try{
            await MentorModel.findById(req.params.id, null, async (err, mentor) => {
                if(err || !mentor) throw "Mentor Not Found"
                await UserModel.findByIdAndDelete(mentor.user_id)
                mentor.remove()
            })
        }catch(err){
            res.status(201).json({error:err})
        }
        return res.json("deleted successfully")
    }
}