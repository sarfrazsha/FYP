const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ResultSchema = new schema({
    studentId: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    classNo: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        required: true
    },
    subjects: [{
        subjectId: String,
        name: String,
        score: Number,
        totalMarks: Number
    }],
    grandTotal: {
        type: Number,
        required: true
    },
    maxTotal: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    markedBy: {
        type: String, // Teacher email
        required: true
    }
}, { timestamps: true });

// Ensure unique result per student per exam type
ResultSchema.index({ studentId: 1, examType: 1 }, { unique: true });

const Result = mongoose.model("result", ResultSchema);
module.exports = Result;
