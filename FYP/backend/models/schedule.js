const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ScheduleSchema = new schema({
    classNo: {
        type: String,
        required: true,
        unique: true
    },
    days: [{
        day: String,
        periods: [{
            time: String,
            subject: String,
            teacher: String
        }]
    }]
}, { timestamps: true });

const Schedule = mongoose.model("schedule", ScheduleSchema);
module.exports = Schedule;
