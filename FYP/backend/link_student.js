const mongoose = require('mongoose');

const ParentSchema = new mongoose.Schema({
    parentEmail: String,
    studentIds: [mongoose.Schema.Types.ObjectId]
}, { strict: false });

const StudentSchema = new mongoose.Schema({
    studentName: String,
    studentEmail: String,
    classNo: String
}, { strict: false });

const Parent = mongoose.model('Parent', ParentSchema, 'parents');
const Student = mongoose.model('Student', StudentSchema, 'students');

async function linkStudent() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/FYP');
        const parent = await Parent.findOne({ parentEmail: /qayoom/i });
        if (!parent) {
            console.log('Parent not found.');
            return;
        }

        const student = await Student.findOne(); // Grab the first available student
        if (!student) {
            console.log('No students found in DB to link.');
            return;
        }

        console.log(`Linking student: ${student.studentName} to Parent: ${parent.parentEmail}`);
        
        if (!parent.studentIds.includes(student._id)) {
            parent.studentIds.push(student._id);
            await parent.save();
            console.log('Successfully linked!');
        } else {
            console.log('Student already linked.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

linkStudent();
