const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');


const app = express();
const mongoose = require("mongoose");
const fs = require('fs');
const port = 8080;
const path = require("path");

// Ensure upload directories exist
const uploadDirs = ['uploads/images', 'uploads/videos', 'uploads/docs'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const upload = require('./middleware/upload');
const getRelativePath = require('./helper/helper')
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// Content Security Policy to allow 'eval' in development
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
    );
    next();
});
const sanitizePath = (p) => {
    if (!p) return '';
    if (typeof p !== 'string') return '';
    if (p.startsWith('http') || p.startsWith('data:')) return p;
    // Remove 'uploads/' and 'images/' prefixes to get just the filename
    const filename = p.replace(/^uploads\//, '').replace(/^images\//, '');
    return `/uploads/images/${filename}`;
};

let adminAlertQueue = [];
const link = 'mongodb://127.0.0.1:27017/FYP';
const Admin = require("./models/admin")
const Parent = require('./models/parent');
const Teacher = require('./models/teacher');
const Student = require("./models/student");
const Announcement = require("./models/announcement");
const Fee = require("./models/fee");
const Attendance = require("./models/attendance");
const Class = require("./models/classes");
const Result = require("./models/result");
const Homework = require("./models/homework");
const HomeworkSubmission = require("./models/homework_submission");
const Schedule = require("./models/schedule");
const Datesheet = require("./models/datesheet");



main()
    .then(() => {
        console.log("connected to DB")
    })
    .catch((err) => {
        console.log(err)
    })
async function main() {
    await mongoose.connect(link);

}

// Update Profile Picture
app.post("/api/user/profile-picture", upload.single('profilePic'), async (req, res) => {
    try {
        const { email, role } = req.body;
        const profilePic = req.file ? req.file.filename : null;

        if (!email || !role || !profilePic) {
            return res.status(400).json({ message: "Missing required data" });
        }

        console.log("Updating Profile Picture:", { email, role, profilePic });

        let user;
        const roleLower = role.toLowerCase();

        if (roleLower === 'admin') {
            user = await Admin.findOneAndUpdate({ adminEmail: email }, { adminImage: profilePic }, { new: true });
        } else if (roleLower === 'teacher') {
            user = await Teacher.findOneAndUpdate({ teacherEmail: email }, { teacherProfile: profilePic }, { new: true });
        } else if (roleLower === 'student') {
            user = await Student.findOneAndUpdate({ studentEmail: email }, { studentImage: profilePic }, { new: true });
        } else if (roleLower === 'parent') {
            user = await Parent.findOneAndUpdate({ parentEmail: email }, { parentImage: profilePic }, { new: true });
        }

        console.log("Database update result:", user ? "Success" : "User Not Found");

        if (!user) {
            return res.status(404).json({ message: `User not found with email ${email} and role ${roleLower}` });
        }

        res.json({ message: "Profile picture updated successfully", profilePic });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete Profile Picture
app.delete("/api/user/profile-picture", async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ message: "Missing required data" });
        }

        let user;
        const roleLower = role.toLowerCase();

        if (roleLower === 'admin') {
            user = await Admin.findOneAndUpdate({ adminEmail: email }, { adminImage: '' }, { new: true });
        } else if (roleLower === 'teacher') {
            user = await Teacher.findOneAndUpdate({ teacherEmail: email }, { teacherProfile: '' }, { new: true });
        } else if (roleLower === 'student') {
            user = await Student.findOneAndUpdate({ studentEmail: email }, { studentImage: '' }, { new: true });
        } else if (roleLower === 'parent') {
            user = await Parent.findOneAndUpdate({ parentEmail: email }, { parentImage: '' }, { new: true });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Profile picture deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
app.listen(port, () => {
    console.log(`app is running on`, { port })
})
app.get("/api/test", (req, res) => {
    res.json({ message: "React connected successfully" });
});

app.get("/admin", async (req, res) => {
    const admin = new Admin({
        adminId: uuidv4(),
        adminName: "Muhammad Muntaha",
        adminEmail: "muntaha1212@gmail.com",
        adminPassword: "12345678",
        adminPhone: "03123828383"
    })



    await admin.save()
        .then(() => {
            res.send("Admin Added")

        });



})
app.get("/users", async (req, res) => {
    let countStudent = 0, countParents = 0, countAdmins, countTeachers;
    countParents = await Parent.countDocuments({});
    countStudent = await Student.countDocuments({});
    countTeachers = await Teacher.countDocuments({});
    countAdmins = await Admin.countDocuments({});

    const countClasses = await Class.countDocuments({});



    const monthlyFeeData = await Fee.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: '$month', total: { $sum: '$amount' } } }
    ]);
    const monthlyFeeStats = monthlyFeeData.map(item => ({
        month: item._id,
        total: item.total
    }));


    const feesPendingCount = await Fee.countDocuments({ status: 'Pending' });
    const feesReviewCount = await Fee.countDocuments({ status: 'Review' });
    const feesPaidCount = await Fee.countDocuments({ status: 'Paid' });

    res.status(200).json({
        totalStudents: countStudent,
        totalParents: countParents,
        totalAdmins: countAdmins,
        totalTeachers: countTeachers,
        totalClasses: countClasses,
        monthlyFeeStats: monthlyFeeStats,
        feesPendingCount: feesPendingCount,
        feesReviewCount: feesReviewCount,
        feesPaidCount: feesPaidCount
    })
})

app.get("/api/teacher/stats/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const teacherClass = await Class.findOne({ teacherEmail: email });
        if (!teacherClass) {
            return res.json({ students: 0, attendanceToday: 0, className: 'Not Assigned' });
        }

        const className = `${teacherClass.className} - ${teacherClass.section}`;
        const studentsCount = await Student.countDocuments({ classNo: className });

        // Get start and end of today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendanceRecords = await Attendance.find({
            classNo: className,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        let attendancePercentage = 0;
        if (attendanceRecords.length > 0 && studentsCount > 0) {
            const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
            // Only count percentage based on marked records to avoid 0% if partial, or based on studentsCount.
            // Usually attendance is marked for all students at once.
            attendancePercentage = Math.round((presentCount / studentsCount) * 100);
        }

        res.json({
            students: studentsCount,
            attendanceToday: attendancePercentage,
            className: className
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching teacher stats" });
    }
});

app.get("/api/reports/teacher/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const teacherClass = await Class.findOne({ teacherEmail: email });
        if (!teacherClass) return res.status(404).json({ message: "No class assigned" });

        const className = `${teacherClass.className} - ${teacherClass.section}`;
        const students = await Student.find({ classNo: className });

        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const attendanceRecords = await Attendance.find({
            classNo: className,
            date: {
                $gte: firstDayLastMonth,
                $lte: lastDayLastMonth
            }
        });

        const uniqueDates = [...new Set(attendanceRecords.map(att => new Date(att.date).toDateString()))];
        const totalMarkedDays = uniqueDates.length;

        let attendanceStats = students.map(s => {
            const studentRecords = attendanceRecords.filter(att => att.studentId === s._id.toString());
            const presentCount = studentRecords.filter(rec => rec.status === 'Present').length;

            return {
                name: s.studentName,
                rollNo: s.studentRollNo,
                percentage: totalMarkedDays > 0 ? Math.round((presentCount / totalMarkedDays) * 100) : 0
            };
        });

        res.json({
            className,
            month: firstDayLastMonth.toLocaleString('default', { month: 'long' }),
            stats: attendanceStats
        });
    } catch (err) {
        res.status(500).json({ message: "Error generating report" });
    }
});


app.get("/api/classes", async (req, res) => {
    try {
        const classes = await Class.find({}).lean();
        const teacherEmails = classes.map(c => c.teacherEmail).filter(Boolean);
        const teachers = await Teacher.find({ teacherEmail: { $in: teacherEmails } }).lean();
        const teacherByEmail = teachers.reduce((map, t) => {
            map[t.teacherEmail] = t.teacherName;
            return map;
        }, {});

        res.status(200).json(classes.map(c => ({
            id: c._id,
            _id: c._id,
            name: c.className,
            section: c.section,
            teacher: teacherByEmail[c.teacherEmail] || c.teacherId || 'Unassigned',
            teacherEmail: c.teacherEmail
        })));
    } catch (err) {
        res.status(500).json({ message: "Error fetching classes" });
    }
});

app.post("/api/classes", async (req, res) => {
    try {
        const { name, section, teacher, teacherEmail } = req.body;
        const newClass = new Class({
            className: name,
            section,
            teacherId: teacher,
            teacherEmail
        });
        await newClass.save();
        res.status(201).json(newClass);
    } catch (err) {
        console.error("Class Save Error:", err);
        res.status(500).json({ message: "Error creating class" });
    }
});

app.put("/api/classes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, section, teacher, teacherEmail } = req.body;
        const updatedClass = await Class.findByIdAndUpdate(id, {
            className: name,
            section,
            teacherId: teacher,
            teacherEmail
        }, { new: true });
        res.json(updatedClass);
    } catch (err) {
        res.status(500).json({ message: "Error updating class" });
    }
});

app.delete("/api/classes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await Class.findByIdAndDelete(id);
        res.json({ message: "Class deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting class" });
    }
});

app.get("/api/teachers/unassigned", async (req, res) => {
    try {
        const teachers = await Teacher.find({}).lean();
        const classes = await Class.find({}).lean();
        const assignedEmails = classes.map(c => c.teacherEmail);
        const unassigned = teachers.filter(t => !assignedEmails.includes(t.teacherEmail));
        res.json(unassigned);
    } catch (err) {
        res.status(500).json({ message: "Error fetching unassigned teachers" });
    }
});


app.post("/students", (req, res, next) => {
    upload.fields([
        { name: 'studentProfilePicture', maxCount: 1 },
        { name: 'parentProfilePicture', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            console.error("Multer Error:", err);
            return res.status(400).json({ message: "File upload error: " + err.message });
        }
        next();
    });
}, async (req, res) => {
    try {

        let { studentName, studentAge, studentRollNo, studentGender, studentEmail, studentPassword, studentClass, parentName, parentPhone, parentAddress, parentEmail, parentPassword } = req.body;

        // Validate password length
        if (!studentPassword || studentPassword.length < 8) {
            return res.status(400).json({ message: "Student password must be at least 8 characters." });
        }
        if (!parentPassword || parentPassword.length < 8) {
            return res.status(400).json({ message: "Parent password must be at least 8 characters." });
        }

        // Check duplicate roll number
        const existingRoll = await Student.findOne({ studentRollNo });
        if (existingRoll) {
            return res.status(400).json({ message: "Roll number already exists. Each student must have a unique roll number." });
        }

        // Check duplicate emails
        const existingStudentEmail = await Student.findOne({ studentEmail });
        if (existingStudentEmail) {
            return res.status(400).json({ message: "Student email already exists." });
        }

        const studentProfilePicture = getRelativePath(req.files, 'studentProfilePicture');
        const parentProfilePicture = getRelativePath(req.files, 'parentProfilePicture');

        console.log("Student Image Path:", studentProfilePicture || "NONE");
        console.log("Parent Image Path:", parentProfilePicture || "NONE");

        const student = new Student({
            classNo: studentClass || '',
            studentName: studentName,
            studentAge: studentAge,
            studentRollNo: studentRollNo,
            studentGender: studentGender,
            studentEmail: studentEmail,
            studentPassword: studentPassword,
            studentImage: studentProfilePicture
        });
        let savedStudent = await student.save();

        // Check if parent with same email already exists
        let existingParent = await Parent.findOne({ parentEmail: parentEmail });
        let savedParent;

        if (existingParent) {
            // Add student to existing parent's studentIds array
            if (!existingParent.studentIds.includes(savedStudent._id)) {
                existingParent.studentIds.push(savedStudent._id);
            }
            // Add to classNos if not already there
            if (!existingParent.classNos.includes(studentClass)) {
                existingParent.classNos.push(studentClass || '');
            }
            savedParent = await existingParent.save();
        } else {
            // Create new parent with studentIds array
            const parent = new Parent({
                studentIds: [savedStudent._id],
                classNos: [studentClass || ''],
                parentName: parentName,
                parentPhone: parentPhone,
                parentAddress: parentAddress,
                parentEmail: parentEmail,
                parentPassword: parentPassword,
                parentImage: parentProfilePicture
            });
            savedParent = await parent.save();
        }

        res.status(201).json({
            message: "Student and Parent data saved successfully!",
            student: savedStudent,
            parent: savedParent
        });
    } catch (err) {
        console.error("Critical Registration Error:", err);
        res.status(500).json({ message: err.message || "Registration failed." });
    }
})
app.get("/api/students-detailed", async (req, res) => {
    try {
        const students = await Student.find({}).lean();
        const parents = await Parent.find({}).lean();

        const detailedStudents = students.map(s => {
            const parent = parents.find(p => 
                p.studentIds && p.studentIds.some(id => id.toString() === s._id.toString())
            );

            return {
                id: s._id,
                studentName: s.studentName,
                studentAge: s.studentAge,
                studentRollNo: s.studentRollNo,
                studentGender: s.studentGender,
                studentClass: s.classNo,
                studentEmail: s.studentEmail,
                studentPassword: s.studentPassword,
                studentProfilePicture: sanitizePath(s.studentImage),
                studentImage: s.studentImage || '',
                parentName: parent ? parent.parentName : '',
                parentPhone: parent ? parent.parentPhone : '',
                parentEmail: parent ? parent.parentEmail : '',
                parentPassword: parent ? parent.parentPassword : '',
                parentAddress: parent ? parent.parentAddress : '',
                parentProfilePicture: sanitizePath(parent ? parent.parentImage : ''),
                parentImage: parent ? parent.parentImage : ''
            };
        });

        res.json(detailedStudents);
    } catch (err) {
        console.error("Error fetching detailed students:", err);
        res.status(500).json({ message: "Error fetching detailed student info" });
    }
});

// 
// 
app.post("/student/login", async (req, res) => {
    try {
        let { email, password, role } = req.body;
        role = (role || '').trim().toLowerCase();

        let user = null;
        let dbPassword = null;
        let uname = "";
        let profilePic = "";



        if (role === "student") {
            user = await Student.findOne({ studentEmail: email });
            if (user) {
                dbPassword = user.studentPassword;
                uname = user.studentName;
                profilePic = sanitizePath(user.studentImage);
            }

        } else if (role === "parent") {
            user = await Parent.findOne({ parentEmail: email });
            if (user) {
                dbPassword = user.parentPassword;
                uname = user.parentName;
                profilePic = sanitizePath(user.parentImage);
            }
        } else if (role === "teacher") {
            user = await Teacher.findOne({ teacherEmail: email });
            if (user) {
                dbPassword = user.teacherPassword;
                uname = user.teacherName;
                profilePic = sanitizePath(user.teacherProfile);
            }
        } else {
            user = await Admin.findOne({ adminEmail: email });
            if (user) {
                dbPassword = user.adminPassword;
                uname = user.adminName;
                profilePic = sanitizePath(user.adminImage);
            }
        }

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (dbPassword === password) {
            const responseData = {
                message: "Logged in Successfully!",
                email: email,
                role: role,
                uname: uname,
                profilePic: profilePic
            };


            if (role === "teacher") {
                const tClass = await Class.findOne({ teacherEmail: email });
                responseData.teacherClass = tClass ? `${tClass.className} - ${tClass.section}` : 'Not Assigned';
            } else if (role === "parent") {
                // Get all children for this parent
                const children = await Student.find({ _id: { $in: user.studentIds } }).lean();
                responseData.children = children.map(child => ({
                    id: child._id,
                    name: child.studentName,
                    rollNo: child.studentRollNo,
                    classNo: child.classNo,
                    age: child.studentAge,
                    gender: child.studentGender,
                    email: child.studentEmail,
                    image: sanitizePath(child.studentImage)
                }));
                // Set first child as default selected
                if (children.length > 0) {
                    responseData.selectedChildId = children[0]._id;
                    responseData.classNo = children[0].classNo;
                }
            } else if (role === "student") {
                responseData.studentId = user._id;
                responseData.classNo = user.classNo;
            }

            return res.status(201).json(responseData);
        } else {
            return res.status(400).json({ message: "Wrong Password" });
        }

    } catch (err) {
        console.error("ERROR:", err);
        return res.status(500).json({ message: "Server error during login" });
    }
});


app.put("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            studentName, studentEmail, studentPassword, studentAge, studentGender,
            parentName, parentPhone, parentEmail, parentPassword, parentAddress
        } = req.body;

        // Password length validations
        if (studentPassword && studentPassword.length < 8) {
            return res.status(400).json({ message: "Student password must be at least 8 characters" });
        }
        if (parentPassword && parentPassword.length < 8) {
            return res.status(400).json({ message: "Parent password must be at least 8 characters" });
        }

        const existingStudent = await Student.findById(id);
        if (!existingStudent) return res.status(404).json({ message: "Student not found" });

        // Update Student (Roll number is deliberately excluded)
        const studentUpdateData = {
            studentName, studentEmail, studentAge, studentGender
        };
        if (studentPassword) studentUpdateData.studentPassword = studentPassword;

        await Student.findByIdAndUpdate(id, studentUpdateData);

        // Update Parent
        const parentUpdateData = {
            parentName, parentPhone, parentEmail, parentAddress
        };
        if (parentPassword) parentUpdateData.parentPassword = parentPassword;

        await Parent.findOneAndUpdate({ studentId: id }, parentUpdateData);

        res.json({ message: "Student and Parent updated successfully!" });
    } catch (err) {
        console.error("Error updating student/parent:", err);
        res.status(500).json({ message: "Failed to update records" });
    }
});

app.delete("/api/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStudent = await Student.findByIdAndDelete(id);

        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        await Parent.deleteMany({ studentId: id });

        res.json({ message: "Student and linked parent deleted successfully" });
    } catch (err) {
        console.error("Error deleting student and parent:", err);
        res.status(500).json({ message: "Error deleting student and linked parent" });
    }
});

app.post("/users", upload.fields([{ name: 'profilePicture', maxCount: 1 }]), async (req, res) => {
    try {
        let { teacherName, phoneNumber, email, password, address } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ message: "Teacher password must be at least 8 characters." });
        }

        const profilePicture = getRelativePath(req.files, 'profilePicture');

        const teacher = new Teacher({
            teacherName: teacherName,
            teacherContact: phoneNumber,
            teacherEmail: email,
            teacherAddress: address,
            teacherPassword: password,
            teacherProfile: profilePicture
        });


        await teacher.save();
        res.status(201).json({
            message: "Teacher data saved successfully!"
        });
    } catch (err) {
        console.error("Teacher Save Error:", err);
        res.status(500).json({ message: err.message || "Error saving teacher record" });
    }
});


app.get("/api/teachers", async (req, res) => {
    try {
        const teachers = await Teacher.find({}).lean();
        const classes = await Class.find({}).lean();

        const teachersWithPics = teachers.map(t => {
            const assignedClass = classes.find(c => c.teacherEmail === t.teacherEmail);
            return {
                ...t,
                id: t._id,
                class: assignedClass ? `${assignedClass.className} - ${assignedClass.section}` : 'Not Assigned',
                phoneNumber: t.teacherContact,
                email: t.teacherEmail,
                profilePicture: t.teacherProfile ? `/uploads/${t.teacherProfile}` : ''
            };
        });
        res.json(teachersWithPics);
    } catch (err) {
        res.status(500).json({ message: "Error fetching teachers" });
    }
});



app.put("/api/teacher/update/:id", upload.fields([{ name: 'profilePicture', maxCount: 1 }]), async (req, res) => {
    try {
        const { id } = req.params;
        const { teacherName, phoneNumber, email, address, password } = req.body;

        if (password && password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const existingTeacher = await Teacher.findById(id);
        if (!existingTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const updatedData = {
            teacherName,
            teacherContact: phoneNumber,
            teacherEmail: email,
            teacherAddress: address,
        };

        if (password) {
            updatedData.teacherPassword = password;
        }

        const profilePicture = getRelativePath(req.files, 'profilePicture');
        if (profilePicture) {
            updatedData.teacherProfile = profilePicture;
        }

        const teacher = await Teacher.findByIdAndUpdate(id, updatedData, { new: true });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        if (existingTeacher.teacherEmail !== email || existingTeacher.teacherName !== teacherName) {
            await Class.updateMany(
                {
                    $or: [
                        { teacherEmail: existingTeacher.teacherEmail },
                        { teacherId: existingTeacher.teacherName }
                    ]
                },
                {
                    teacherEmail: email,
                    teacherId: teacherName
                }
            );
        }

        res.json({ message: "Teacher updated successfully", teacher });
    } catch (err) {
        console.error("Teacher Update Error:", err);
        res.status(500).json({ message: "Error updating teacher record" });
    }
});


app.delete("/api/teacher/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Teacher.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.json({ message: "Teacher deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting teacher" });
    }
});




app.get("/api/announcements", async (req, res) => {
    try {
        const { role } = req.query;
        const now = new Date();
        let filter = {

            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
        };
        if (role && role.toLowerCase() !== 'admin') {

            filter.targetAudience = { $in: ['all', role.toLowerCase()] };
        }
        const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: "Error fetching announcements" });
    }
});


app.post("/api/announcements", async (req, res) => {
    try {
        const { title, content, role, targetAudience, durationDays } = req.body;
        if (role !== "admin" && role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized: Admins only" });
        }

        let expiresAt = null;
        if (durationDays && Number(durationDays) > 0) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + Number(durationDays));
        }

        const newAnnouncement = new Announcement({
            title,
            content,
            targetAudience: targetAudience || 'all',
            expiresAt
        });
        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    } catch (err) {
        res.status(500).json({ message: "Error creating announcement" });
    }
});

app.put("/api/announcements/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, role, targetAudience, durationDays } = req.body;

        if (role !== "admin" && role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized: Admins only" });
        }

        let expiresAt = null;
        if (durationDays && Number(durationDays) > 0) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + Number(durationDays));
        }

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { title, content, targetAudience: targetAudience || 'all', expiresAt },
            { new: true }
        );
        res.json(updatedAnnouncement);
    } catch (err) {
        res.status(500).json({ message: "Error updating announcement" });
    }
});

app.put("/api/announcements/mark-all-read", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email required" });

        await Announcement.updateMany(
            { readBy: { $ne: email } },
            { $addToSet: { readBy: email } }
        );
        res.json({ message: "All marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error marking announcements as read" });
    }
});

app.delete("/api/announcements/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { role } = req.body;
        const userRole = role || req.query.role;

        if (userRole !== "admin" && userRole !== "Admin") {
            return res.status(403).json({ message: "Unauthorized: Admins only" });
        }

        await Announcement.findByIdAndDelete(id);
        res.json({ message: "Announcement deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting announcement" });
    }
});


app.get("/api/parents", async (req, res) => {
    try {
        const parents = await Parent.find({}).lean();
        const students = await Student.find({}).lean();
        const parentsExtended = parents.map(p => {
            const student = students.find(s => s._id.toString() === p.studentId?.toString());
            return {
                ...p,
                studentName: student ? student.studentName : 'Unknown',
                studentRollNo: student ? student.studentRollNo : '',
                studentAge: student ? student.studentAge : '',
                studentGender: student ? student.studentGender : '',
                studentImage: sanitizePath(student ? student.studentImage : ''),
                parentImage: sanitizePath(p.parentImage),
                classNo: p.classNo || (student ? student.classNo : '')
            };
        });
        res.json(parentsExtended);
    } catch (err) {
        res.status(500).json({ message: "Error fetching parents" });
    }
});

// Get parent's children
app.get("/api/parent/children/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const parent = await Parent.findOne({ parentEmail: email });
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        const children = await Student.find({ _id: { $in: parent.studentIds } }).lean();
        const childrenData = children.map(child => ({
            id: child._id,
            name: child.studentName,
            rollNo: child.studentRollNo,
            classNo: child.classNo,
            age: child.studentAge,
            gender: child.studentGender,
            email: child.studentEmail,
            image: sanitizePath(child.studentImage)
        }));

        res.json(childrenData);
    } catch (err) {
        res.status(500).json({ message: "Error fetching children" });
    }
});

app.post("/api/fees", upload.single('adminVoucher'), async (req, res) => {
    try {
        const { studentName, parentEmail, amount, dueDate, month, year, classNo, role } = req.body;
        if (role !== "admin" && role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (!month || !year) {
            return res.status(400).json({ message: "Fee month and year are required." });
        }

        const existingFee = await Fee.findOne({ parentEmail, month, year });
        if (existingFee) {
            return res.status(400).json({ message: `A fee voucher for ${month} ${year} has already been issued to this parent.` });
        }

        const adminVoucher = req.file ? req.file.path.replace(/\\/g, '/').replace(/^uploads\//, '') : '';
        if (!adminVoucher) {
            return res.status(400).json({ message: "Fee voucher file is required." });
        }

        const newFee = new Fee({
            studentName,
            parentEmail,
            amount,
            dueDate,
            month,
            year,
            adminVoucher,
            classNo,
            status: 'Pending'
        });
        await newFee.save();
        res.status(201).json(newFee);
    } catch (err) {
        console.error("Error creating fee alert:", err);
        res.status(500).json({ message: "Error creating fee alert", error: err });
    }
});

app.post("/api/fees/bulk", upload.single('adminVoucher'), async (req, res) => {
    try {
        let { parents, amount, dueDate, month, year, classNo, role } = req.body;
        if (role !== "admin" && role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (!month || !year) {
            return res.status(400).json({ message: "Fee month and year are required." });
        }

        if (typeof parents === 'string') {
            try {
                parents = JSON.parse(parents);
            } catch (e) {
                return res.status(400).json({ message: "Invalid parents data format." });
            }
        }

        if (!parents || !parents.length) {
            return res.status(400).json({ message: "No parents found to issue fees to." });
        }

        const adminVoucher = req.file ? req.file.path.replace(/\\/g, '/').replace(/^uploads\//, '') : '';
        if (!adminVoucher) {
            return res.status(400).json({ message: "Fee voucher file is required." });
        }

        const parentEmails = parents.map(p => p.parentEmail).filter(Boolean);
        const existingFees = await Fee.find({ parentEmail: { $in: parentEmails }, month, year });
        if (existingFees.length > 0) {
            const duplicates = [...new Set(existingFees.map(f => `${f.parentEmail}`))].join(', ');
            return res.status(400).json({ message: `Fee vouchers for ${month} ${year} already exist for: ${duplicates}` });
        }

        const feesToInsert = parents.map(p => ({
            studentName: p.studentName || "Student",
            parentEmail: p.parentEmail,
            amount,
            dueDate,
            month,
            year,
            adminVoucher,
            classNo,
            status: 'Pending'
        }));

        await Fee.insertMany(feesToInsert);
        res.status(201).json({ message: `Successfully issued ${feesToInsert.length} fee alerts.` });
    } catch (err) {
        console.error("Bulk fee error:", err);
        res.status(500).json({ message: "Error creating bulk fee alerts", error: err });
    }
});

app.get("/api/fees", async (req, res) => {
    try {
        const { role, email } = req.query;
        if (role === "admin" || role === "Admin") {
            const fees = await Fee.find().sort({ createdAt: -1 });
            return res.json(fees);
        } else if (role === "parent" || role === "Parent") {
            const fees = await Fee.find({ parentEmail: email }).sort({ createdAt: -1 });
            return res.json(fees);
        }
        return res.status(403).json({ message: "Unauthorized role" });
    } catch (err) {
        res.status(500).json({ message: "Error fetching fees" });
    }
});

app.put("/api/fees/:id/pay", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFee = await Fee.findByIdAndUpdate(
            id,
            { status: 'Paid' },
            { new: true }
        );
        res.json(updatedFee);
    } catch (err) {
        res.status(500).json({ message: "Error paying fee" });
    }
});

app.put("/api/fees/:id/upload-receipt", upload.single('parentReceipt'), async (req, res) => {
    try {
        const { id } = req.params;
        const parentReceipt = req.file ? req.file.path.replace(/\\/g, '/').replace(/^uploads\//, '') : '';

        if (!parentReceipt) {
            return res.status(400).json({ message: "Receipt file is required." });
        }

        const updatedFee = await Fee.findByIdAndUpdate(
            id,
            { parentReceipt, status: 'Review' },
            { new: true }
        );

        if (updatedFee) {
            adminAlertQueue.push({
                _id: Date.now().toString(),
                title: "Action Required: Fee Receipt Uploaded",
                content: `${updatedFee.studentName} has uploaded a receipt for ${updatedFee.month}. Please review in the Fee Records Hub.`,
                isAlert: true,
                createdAt: new Date()
            });
        }

        res.json(updatedFee);
    } catch (err) {
        console.error("Receipt upload error:", err);
        res.status(500).json({ message: "Error uploading receipt" });
    }
});

app.put("/api/fees/:id/approve", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFee = await Fee.findByIdAndUpdate(
            id,
            { status: 'Paid' },
            { new: true }
        );
        res.json(updatedFee);
    } catch (err) {
        res.status(500).json({ message: "Error approving fee" });
    }
});





app.get("/api/students/class/:classNo", async (req, res) => {
    try {
        const { classNo } = req.params;
        const students = await Student.find({ classNo: classNo.trim() }).sort({ studentName: 1 }).lean();


        const mappedStudents = students.map(s => ({
            ...s,
            studentId: s._id
        }));

        res.json(mappedStudents);
    } catch (err) {
        res.status(500).json({ message: "Error fetching students for class" });
    }
});

app.post("/api/attendance", async (req, res) => {
    try {
        const { attendanceRecords, date, classNo, markedBy } = req.body;

        if (!attendanceRecords || !attendanceRecords.length) {
            return res.status(400).json({ message: "No attendance records provided" });
        }

        const bulkOps = attendanceRecords.map(record => ({
            updateOne: {
                filter: {
                    studentId: record.studentId,
                    date: new Date(date).setHours(0, 0, 0, 0)
                },
                update: {
                    $set: {
                        studentName: record.studentName,
                        classNo: classNo,
                        status: record.status,
                        markedBy: markedBy,
                        date: new Date(date).setHours(0, 0, 0, 0)
                    }
                },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(bulkOps);
        res.json({ message: "Attendance marked successfully" });
    } catch (err) {
        console.error("Attendance save error:", err);
        res.status(500).json({ message: "Error marking attendance" });
    }
});


app.get("/api/attendance/class/:classNo", async (req, res) => {
    try {
        const { classNo } = req.params;
        const { date } = req.query;
        const searchDate = new Date(date).setHours(0, 0, 0, 0);

        const records = await Attendance.find({
            classNo: classNo,
            date: searchDate
        });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: "Error fetching attendance records" });
    }
});

app.get("/api/attendance/student/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const records = await Attendance.find({ studentId: studentId }).sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: "Error fetching student attendance history" });
    }
});

// --- RESULTS ENDPOINTS ---
app.post("/api/results", async (req, res) => {
    try {
        const { results, examType, classNo, expiryDate, markedBy } = req.body;

        const bulkOps = results.map(rec => ({
            updateOne: {
                filter: { studentId: rec.studentId, examType: examType },
                update: {
                    $set: {
                        studentName: rec.studentName,
                        classNo: classNo,
                        subjects: rec.subjects,
                        grandTotal: rec.grandTotal,
                        maxTotal: rec.maxTotal,
                        grade: rec.grade,
                        expiryDate: new Date(expiryDate),
                        markedBy: markedBy
                    }
                },
                upsert: true
            }
        }));

        await Result.bulkWrite(bulkOps);
        res.json({ message: "Results published successfully" });
    } catch (err) {
        console.error("Result save error:", err);
        res.status(500).json({ message: "Error publishing results" });
    }
});

app.get("/api/results/student/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const now = new Date();
        const records = await Result.find({
            studentId,
            expiryDate: { $gt: now }
        }).sort({ updatedAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: "Error fetching results" });
    }
});

app.get("/api/results/class/:classNo", async (req, res) => {
    try {
        const classNo = req.params.classNo?.trim();
        const now = new Date();
        const normalizedRegex = new RegExp('^' + classNo.replace(/\s+/g, '\\s*') + '$', 'i');
        const records = await Result.find({
            classNo: normalizedRegex,
            expiryDate: { $gt: now }
        }).sort({ updatedAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: "Error fetching class results" });
    }
});

// --- HOMEWORK ENDPOINTS ---
app.post("/api/homework", upload.single('file'), async (req, res) => {
    try {
        const { title, subject, dueDate, description, classNo, assignedBy } = req.body;

        let filePath = null;
        if (req.file) {
            filePath = req.file.path.replace(/\\/g, '/');
        }
        const fileName = req.file ? req.file.originalname : null;

        const homework = new Homework({
            title,
            subject,
            dueDate: new Date(dueDate),
            description,
            fileName,
            filePath,
            classNo,
            assignedBy
        });

        const savedHomework = await homework.save();

        // Initialize submissions for all students in this class
        const students = await Student.find({ classNo: classNo.trim() });
        if (students.length > 0) {
            const submissions = students.map(s => ({
                homeworkId: savedHomework._id,
                studentId: s._id,
                studentName: s.studentName,
                classNo: classNo,
                status: 'Pending'
            }));
            await HomeworkSubmission.insertMany(submissions);
        }

        res.json({ message: "Homework assigned successfully" });
    } catch (err) {
        console.error("Homework save error:", err);
        res.status(500).json({ message: "Error assigning homework" });
    }
});

app.get("/api/homework/class/:classNo", async (req, res) => {
    try {
        const { classNo } = req.params;
        const homeworks = await Homework.find({
            classNo,
            dueDate: { $gt: new Date() }
        }).sort({ createdAt: -1 });
        res.json(homeworks);
    } catch (err) {
        res.status(500).json({ message: "Error fetching homework" });
    }
});

app.delete("/api/homework/:id", async (req, res) => {
    try {
        await Homework.findByIdAndDelete(req.params.id);
        await HomeworkSubmission.deleteMany({ homeworkId: req.params.id });
        res.json({ message: "Homework deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting homework" });
    }
});

app.put("/api/homework/:id", upload.single('file'), async (req, res) => {
    try {
        const { title, subject, dueDate, description } = req.body;
        const updateData = { title, subject, dueDate: new Date(dueDate), description };

        if (req.file) {
            updateData.filePath = req.file.path.replace(/\\/g, '/');
            updateData.fileName = req.file.originalname;
        }

        await Homework.findByIdAndUpdate(req.params.id, updateData);
        res.json({ message: "Homework updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating homework" });
    }
});

app.get("/api/homework/:homeworkId/submissions", async (req, res) => {
    try {
        const { homeworkId } = req.params;
        const submissions = await HomeworkSubmission.find({ homeworkId }).sort({ studentName: 1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: "Error fetching submissions" });
    }
});

app.put("/api/homework/submission/:id", async (req, res) => {
    try {
        const { status } = req.body;
        await HomeworkSubmission.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: "Status updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating status" });
    }
});

app.get("/api/student/dashboard-stats/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const pendingSubmissions = await HomeworkSubmission.find({
            studentId,
            status: 'Pending'
        }).populate('homeworkId');

        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        // Filter out expired homework from the pending list
        const activePending = pendingSubmissions.filter(sub =>
            sub.homeworkId && new Date(sub.homeworkId.dueDate) > now
        );

        let isUrgent = false;
        for (const sub of activePending) {
            if (sub.homeworkId && sub.homeworkId.dueDate) {
                const dueDate = new Date(sub.homeworkId.dueDate);
                if (dueDate > now && dueDate <= oneHourFromNow) {
                    isUrgent = true;
                    break;
                }
            }
        }

        // Also check if an exam is coming soon
        const student = await Student.findById(studentId);
        let upcomingExamLabel = 'To Be Announced';
        if (student && student.classNo) {
            const normalizedRegex = new RegExp('^' + student.classNo.replace(/\s+/g, '\\s*') + '$', 'i');
            const latestDatesheet = await Datesheet.findOne({ classNo: normalizedRegex }).sort({ updatedAt: -1 });
            if (latestDatesheet) {
                upcomingExamLabel = latestDatesheet.examType;
            }
        }

        res.json({
            pendingHomework: activePending.length,
            isUrgent: isUrgent,
            upcomingExam: upcomingExamLabel,
            studentClass: student ? student.classNo : 'Unknown'
        });
    } catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ message: "Error fetching student stats" });
    }
});

// --- SCHEDULE ENDPOINTS ---
app.post("/api/schedule", async (req, res) => {
    try {
        const { classNo, days } = req.body;
        await Schedule.findOneAndUpdate(
            { classNo },
            { days },
            { upsert: true, new: true }
        );
        res.json({ message: "Schedule updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating schedule" });
    }
});

app.put("/api/fees/:id/approve", async (req, res) => {
    try {
        await Fee.findByIdAndUpdate(req.params.id, { status: "Paid" });
        res.json({ message: "Fee approved" });
    } catch (err) {
        res.status(500).json({ message: "Failed to approve fee" });
    }
});

app.put("/api/fees/:id/reject", async (req, res) => {
    try {
        // Reset status to Pending and clear the receipt path
        await Fee.findByIdAndUpdate(req.params.id, {
            status: "Pending",
            parentReceipt: ""
        });
        res.json({ message: "Fee rejected and reset to pending" });
    } catch (err) {
        res.status(500).json({ message: "Failed to reject fee" });
    }
});

app.get("/api/schedule/:classNo", async (req, res) => {
    try {
        const schedule = await Schedule.findOne({ classNo: req.params.classNo });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: "Error fetching schedule" });
    }
});

// --- DATESHEET ENDPOINTS ---
app.post("/api/datesheet", async (req, res) => {
    try {
        const { classNo, examType, exams } = req.body;
        console.log(`[AUDIT] Publishing datesheet for Class: "${classNo}", Type: "${examType}", Exams: ${exams?.length}`);

        if (!classNo || !classNo.trim()) {
            return res.status(400).json({ message: "Class is required to publish a datesheet." });
        }
        if (!examType || !examType.trim()) {
            return res.status(400).json({ message: "Exam type is required." });
        }

        const result = await Datesheet.findOneAndUpdate(
            { classNo: classNo.trim(), examType: examType.trim() },
            { exams },
            { upsert: true, new: true }
        );
        console.log(`[AUDIT] Datesheet saved with _id: ${result._id}, classNo: "${result.classNo}"`);
        res.json({ message: "Datesheet updated successfully" });
    } catch (err) {
        console.error("Datesheet save error:", err);
        res.status(500).json({ message: "Error updating datesheet" });
    }
});

app.get("/api/datesheet/:classNo", async (req, res) => {
    try {
        const classNo = req.params.classNo?.trim();
        console.log(`[DATESHEET FETCH] Looking for datesheets for class: "${classNo}"`);
        // Use a case-insensitive regex that ignores extra spaces between name and section
        const normalizedRegex = new RegExp('^' + classNo.replace(/\s+/g, '\\s*') + '$', 'i');
        const datesheets = await Datesheet.find({ classNo: normalizedRegex }).sort({ updatedAt: -1 });
        console.log(`[DATESHEET FETCH] Found ${datesheets.length} datesheets for class "${classNo}"`);
        res.json(datesheets);
    } catch (err) {
        console.error("Datesheet fetch error:", err);
        res.status(500).json({ message: "Error fetching datesheets" });
    }
});

// Global upload error handler
app.use((err, req, res, next) => {
    if (!err) {
        return next();
    }

    console.error("Upload Error:", err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'System supports only up to 10 MB for uploads.' });
    }

    if (err.message && err.message.includes('Only images, videos, and documents are allowed')) {
        return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: err.message || 'Server error during file upload' });
});

app.use(express.static(path.join(__dirname, "../frontend/dist")));



app.get("/api/notifications/admin", (req, res) => {
    const alerts = [...adminAlertQueue];
    adminAlertQueue = [];
    res.json(alerts);
});

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});
