const mongoose = require("mongoose");
const schema = mongoose.Schema;

const HomeworkSchema = new schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    fileName: {
        type: String
    },
    filePath: {
        type: String
    },
    classNo: {
        type: String,
        required: true
    },
    assignedBy: {
        type: String, // Teacher email
        required: true
    }
}, { timestamps: true });

const Homework = mongoose.model("homework", HomeworkSchema);
module.exports = Homework;