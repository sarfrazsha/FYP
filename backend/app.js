const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');


const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const link = 'mongodb://127.0.0.1:27017/FYP';
const Admin = require("./models/admin")
const Parent = require('./models/parent');
const Teacher = require('./models/teacher');
const Student = require("./models/student");
const Announcement = require("./models/announcement");

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
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
    res.status(201).json({
        totalStudents: countStudent,
        totalParents: countParents,
        totalAdmins: countAdmins,
        totalTeachers: countTeachers
    })


})
app.post("/students", async (req, res) => {
    let { studentName, studentAge, studentRollNo, studentGender, studentEmail, studentPassword, studentRole, parentName, parentPhone, parentAddress, parentEmail, parentPassword, parentRole } = req.body;
    const student = new Student({
        studentId: uuidv4(),
        studentName: studentName,
        studentAge: studentAge,
        studentRollNo: studentRollNo,
        studentGender: studentGender,
        studentEmail: studentEmail,
        studentPassword: studentPassword,
        studentRole: 'student'
    });
    let savedStudent = await student.save();



    const parent = new Parent({
        parentId: uuidv4(),
        studentId: savedStudent.studentId,
        parentName: parentName,
        parentPhone: parentPhone,
        parentAddress: parentAddress,
        parentEmail: parentEmail,
        parentPassword: parentPassword,
        parentRole: 'parent'
    })

    await parent.save();


    res.status(201).json({
        message: "Student and Parent data saved successfully!",



    })
})
// 
// 
app.post("/student/login", async (req, res) => {
    try {
        let { email, password, role } = req.body;
        role = (role || '').trim().toLowerCase();

        let user = null;
        let dbPassword = null;

        if (role === "student") {
            user = await Student.findOne({ studentEmail: email });
            if (user) {
                dbPassword = user.studentPassword;
                uname = user.studentName;
            }

        } else if (role === "parent") {
            user = await Parent.findOne({ parentEmail: email });
            if (user) {
                dbPassword = user.parentPassword;
                uname = user.parentName;
            }
        } else if (role === "teacher") {
            user = await Teacher.findOne({ teacherEmail: email });
            if (user) {
                dbPassword = user.teacherPassword;
                uname = user.teacherName;
            }
        } else {
            user = await Admin.findOne({ adminEmail: email });
            if (user) {
                dbPassword = user.adminPassword;
                uname = user.adminName
            }
        }

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (dbPassword === password) {

            return res.status(201).json({
                message: "Logged in Successfully!",
                email: email,
                role: role,
                uname: uname
            });
        } else {
            return res.status(400).json({ message: "Wrong Password" });
        }

    } catch (err) {
        console.error("ERROR:", err);
        return res.status(500).json({ message: "Server error during login" });
    }
});

app.post("/users", async (req, res) => {

    let { teacherName, phoneNumber, className, email, password, address } = req.body;

    const teacher = new Teacher({
        teacher_id: uuidv4(),
        teacherName: teacherName,
        teacherContact: phoneNumber,
        teacherClass: className,
        teacherEmail: email,
        teacherAddress: address,
        teacherPassword: password,
        role: "TEACHER"



    })
    await teacher.save()
        .then(() => {
            res.status(201).json({
                message: "Teacher data is save Successfully!"
            })
        })

})


// Announcement Routes

// GET all announcements
app.get("/api/announcements", async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: "Error fetching announcements" });
    }
});

// POST create announcement
app.post("/api/announcements", async (req, res) => {
    try {
        const { title, content, role } = req.body;
        // Simple role check
        if (role !== "admin" && role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized: Admins only" });
        }

        const newAnnouncement = new Announcement({
            title,
            content
        });
        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    } catch (err) {
        res.status(500).json({ message: "Error creating announcement" });
    }
});

// PUT update announcement
app.put("/api/announcements/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, role } = req.body;

        if (role !== "admin" && role !== "Admin") {
            return res.status(403).json({ message: "Unauthorized: Admins only" });
        }

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { title, content },
            { new: true }
        );
        res.json(updatedAnnouncement);
    } catch (err) {
        res.status(500).json({ message: "Error updating announcement" });
    }
});

// PUT mark all as read for a user
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

// DELETE announcement
app.delete("/api/announcements/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // Note: In a real app, you'd check auth/role from headers/session here too.
        // For this FYP structure, we might need to pass role in body or query if not using tokens.
        // Assuming the frontend will prevent the call, but let's check body if possible.
        // DELETE requests often don't have a body in some conventions, but Express supports it.
        // Alternatively, we can pass it as a query param or just trust the frontend for this simple demo?
        // Let's rely on a header or query param for delete to be safe-ish?
        // Let's assume the body hack works or use query.
        const { role } = req.body;
        // If body is empty, check query
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

app.use(express.static(path.join(__dirname, "../frontend/dist")));


app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});