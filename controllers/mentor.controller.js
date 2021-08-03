const MentorModel = require('../models/mentor.model');
const UserModel = require('../models/user.model');
module.exports = {
    //========================================================= GET MENTOR, OR LOW LEVEL QUERY ===================================================//
    get: async (req,res) => {
        let mentors;
        let mentorsQueried
        var query = req.query || {};
        try{
            mentorsQueried = await MentorModel.find(query).lean().populate({
                path: 'userId',
                select: 'firstName lastName fullName date_of_birth gender email'
        });
        //JSON BEAUTIFY
            mentors = mentorsQueried.map((mentor) => {
                mentor.userId._id = undefined;                
                mentorTransform = {...mentor.userId,...mentor};
                mentorTransform.userId = undefined;
                return mentorTransform;
            }) 
        }catch(err){
            return res.status(201).json({error:err});
        }
        return res.json(mentors)
    },
    //========================================================= CREATE NEW MENTOR ===================================================//
    post: async (req,res) => {
        var matchedUser = await UserModel.findById(req.params.id);
        // ROLE VALIDATION
        if(matchedUser.role !== "MENTOR"){
            return res.status(201).json({error: "User's role is not MENTOR"})
        }        
        var newMentor = new MentorModel({
            userId: req.params.id,
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
    //========================================================= EDIT MENTOR'S INFORMATION ===================================================//
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
    //========================================================= DELETE MENTOR ===================================================//
    delete: async (req,res) => {
        try{
            await MentorModel.findById(req.params.id, null, async (err, mentor) => {
                if(err || !mentor) throw "Mentor Not Found"
                await UserModel.findByIdAndDelete(mentor.userId)
                mentor.remove()
            })
        }catch(err){
            res.status(201).json({error:err})
        }
        return res.json({result:"deleted successfully"})
    }
}