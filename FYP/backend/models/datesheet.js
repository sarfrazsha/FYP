const mongoose = require("mongoose");
const schema = mongoose.Schema;

const DatesheetSchema = new schema({
    classNo: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        required: true
    },
    exams: [{
        subject: String,
        date: Date,
        time: String,
        startTime: String,
        endTime: String,
        room: String
    }]
}, { timestamps: true });

// One datesheet per class per exam type
DatesheetSchema.index({ classNo: 1, examType: 1 }, { unique: true });

const Datesheet = mongoose.model("datesheet", DatesheetSchema);
module.exports = Datesheet;
