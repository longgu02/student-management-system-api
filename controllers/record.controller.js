const RecordModel = require('../models/record.model');
const StudentRecordModel = require('../models/student-record.model');
const StudentModel = require('../models/student.model');

module.exports = {
    //========================================================= VIEW ALL RECORDS ==============================================================//
    get: async (req,res) => {
        let records;
        var query = req.query
        try{
            records = await RecordModel.find(query).populate('classId')
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(records);
    },
    //========================================================= CREATE RECORD ==============================================================//
    post: async (req,res) => {
        let students;
        let studentRecords;
        const newRecord = new RecordModel({
            name: req.body.name,
            type: req.body.type,
            date: req.body.date,
            note: req.body.note,
            classId: req.body.classId
        }) 
        try{
            await newRecord.save()
        }catch(err){
            return res.status(201).json({error:err})
        }
        students = await StudentModel.find({listClass: req.body.classId}).lean().select('_id');
        for(var studentId of students){
            studentRecords = new StudentRecordModel({
                studentId: studentId,
                recordId: newRecord._id
            })
            try{
                await studentRecords.save()
            }catch(err){
                return res.status(201).json({error: err})
            }
        }
        return res.json(newRecord);
    },
    //========================================================= EDIT RECORD ==============================================================//
    put: async (req,res) => {
        let record;
        record = await RecordModel.findById(req.params.id)
        try{
            if(req.body.name){record.name = req.body.name};
            if(req.body.type){record.type = req.body.type};
            if(req.body.date){record.date = req.body.date};
            if(req.body.classId){record.classId = req.body.classId};
            if(req.body.note){record.note = req.body.note};
            await record.save()
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(record)
    },
    //========================================================= DELETE RECORD ==============================================================//
    delete: async (req,res) => {
        let studentRecords;
        try{
            await RecordModel.findByIdAndDelete(req.params.id);
            await StudentRecordModel.deleteMany({recordId: req.params.id})
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json("deleted successfully")
    },
    //========================================================= VIEW RECORD DETAIL ==============================================================//
    getDetail: async (req,res) => {
        let queriedRecord;
        let recordDetail;
        let record;
        try{
            record = await RecordModel.findById(req.params.recordId)
            if(!record) throw "Record Not Found"
        }catch(err){
            return res.status(201).json({error:err})
        }
        try{
            queriedRecord = await StudentRecordModel.find({recordId: req.params.recordId}).lean().populate({
                path: 'studentId',
                populate: {
                    path: 'userId', 
                    select: 'firstName lastName fullName date_of_birth gender email'
                }
            })
        }catch(err){
            return res.status(201).json({error:err})
        }
        // JSON BEAUTIFY
        recordDetail = queriedRecord.map((item) => {
            item.studentId.userId._id = undefined;
            item.studentId = {...item.studentId,...item.studentId.userId}
            item.studentId.userId = undefined;
            item.studentId.listClass = undefined;
            return item
        })
        res.json({record: record, recordDetail: recordDetail})
    },
    //========================================================== CREATE STUDENT RECORD =========================================================//
    postStudentRecord: async (req,res) => {
        const newStudentRecord = new StudentRecordModel({
            recordId: req.params.recordId,
            studentId: req.params.studentId,
            score: req.body.score,
            note: req.body.note
        });
        try{
            await newStudentRecord.save()
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(newStudentRecord)
    },
    //========================================================= EDIT STUDENT RECORD ==============================================================//
    putStudentRecord: async (req,res) => {
        let studentRecord;
        try{
            studentRecord = await StudentRecordModel.findById(req.params.studentRecordId)
        }catch(err){
            return res.status(400).json({error:err})
        }
        try{
            if(req.body.score){studentRecord.score = req.body.score};
            if(req.body.note){studentRecord.note = req.body.note};
            await studentRecord.save()
        }catch(error){
            return res.status(201).json({error:err})
        }
        res.json(studentRecord)
    },
    //====================================================== DELETE STUDENT RECORD =============================================================//
    deleteStudentRecord: async (req,res) => {
        try{
            await StudentRecordModel.findByIdAndDelete(req.params.id)
        }catch(err){
            return res.status(201).json({error:err})
        }
        res.json({result:"deleted successfully"})
    }  
}