const RecordModel = require('../models/record.model');

module.exports = {
    get: async (req,res) => {
        let records;
        var query = req.query
        try{
            records = await RecordModel.find(query).populate('class_id')
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(records);
    },
    post: async (req,res) => {
        const newRecord = new RecordModel({
            name: req.body.name,
            type: req.body.type,
            date: req.body.date,
            note: req.body.note,
            class_id: req.body.class_id
        }) 
        try{
            await newRecord.save()
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(newRecord);
    },
    put: async (req,res) => {
        let record;
        record = await RecordModel.findById(req.params.id)
        try{
            if(req.body.name){record.name = req.body.name};
            if(req.body.type){record.type = req.body.type};
            if(req.body.date){record.date = req.body.date};
            if(req.body.class_id){record.class_id = req.body.class_id};
            if(req.body.note){record.note = req.body.note};
            await record.save()
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json(record)
    },
    delete: async (req,res) => {
        try{
            await RecordModel.findByIdAndDelete(req.params.id)
        }catch(err){
            return res.status(201).json({error:err})
        }
        return res.json("deleted successfully")
    }  
}