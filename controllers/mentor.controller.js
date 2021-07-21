const MentorModel = require('../models/mentor.model');
const UserModel = require('../models/user.model');
module.exports = {
    get: async (req,res) => {
        let mentors;
        var query = req.query || {};
        try{
            mentors = await MentorModel.find(query).populate('user_id'); 
        }catch(err){
            return res.status(201).json({error:err});
        }
        if(mentors){
            for(var mentor of mentors){
                mentor.user_id.password = undefined;
            };
        };
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
            subject: req.body.subject
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
            if(req.body.subject) {mentor.subject = req.body.subject};
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