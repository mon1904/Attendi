const UserController = require('../controllers/user');
const { User, ROLES } = require('../models/user');
const { Attendance } = require('../models/attendance');
const { Student } = require('../models/student');
const { SchoolClass } = require('../models/schoolClass');
const {name} = require('./names');

let firstnamesLength = name.firstnames.length;
let lastnamesLength = name.lastnames.length;

let genders = ['Male', 'Female'];

module.exports.seed = () => {
  let parentCnt = 0;

  // Create admin user
  let newUser = new User({
    username: "admin",
    password: "admin",
    role: ROLES.ADMIN,
    details: {
      firstname: "admin",
      lastname: "admin",
      gender: "admin",
      mobile: "31313133123123",
      address: "admin"
    },
    email: "admin@admin.com"
  });
  UserController.createUser(newUser, () => { });

  // We make 8 classes (8 is the limit in the excel report)
  for (let i = 0; i < 8; i++) {
    let no = i + 1;
    let teacher = "teacher" + no;
    let newTeacher = new User({
      username: teacher,
      password: "teacher",
      role: ROLES.TEACHER,
      details: {
        firstname: name.firstnames[Math.floor(Math.random() * firstnamesLength)],
        lastname: name.lastnames[Math.floor(Math.random() * lastnamesLength)],
        gender: genders[Math.floor(Math.random() * 2)],
        mobile: "312313123123",
        address: teacher
      },
      email: teacher + "@teacher.com"
    });
    // Save the teacher
    UserController.createUser(newTeacher, (err) => {
      if (err) throw err;
      // Create a school class for the saved teacher
      let newClass = new SchoolClass({
        name: newTeacher.username + " class",
        teacher: newTeacher._id
      });

      // Save the school class
      newClass.save((err) => {
        if (err) throw err;

        // We loop 30 times, creating a student each loop
        for (let j = 0; j < 30; j++) {
          let student = i + "student" + j;

          // Create the student
          let newStudent = new Student({
            schoolClass: newClass._id,
            doctorName: "Doctor",
            doctorPhone: "312313123",
            pps: "32333123",
            dob: new Date(),
            details: {
              firstname: name.firstnames[Math.floor(Math.random() * firstnamesLength)],
              lastname: name.lastnames[Math.floor(Math.random() * lastnamesLength)],
              gender: genders[Math.floor(Math.random() * 2)],
              address: student
            }
          });

          // Save the student
          newStudent.save((err) => {
            parentCnt++;
            let parent1 = "parent" + parentCnt;
            // Create the first parent for the student
            let newParent1 = new User({
              username: parent1,
              password: "parent",
              role: ROLES.PARENT,
              details: {
                firstname: name.firstnames[Math.floor(Math.random() * firstnamesLength)],
                lastname: name.lastnames[Math.floor(Math.random() * lastnamesLength)],
                gender: genders[Math.floor(Math.random() * 2)],
                mobile: "231231313132",
                address: parent1
              },
              email: parent1 + "@parent.com"
            });
            // Save the first parent
            UserController.createUser(newParent1, (err) => {
              if (err) throw err;
              parentCnt++;
              // Create the second parent
              let parent2 = "parent" + parentCnt;
              let newParent2 = new User({
                username: parent2,
                password: "parent",
                role: ROLES.PARENT,
                details: {
                  firstname: name.firstnames[Math.floor(Math.random() * firstnamesLength)],
                  lastname: name.lastnames[Math.floor(Math.random() * lastnamesLength)],
                  gender: genders[Math.floor(Math.random() * 2)],
                  mobile: "231231313132",
                  address: parent2
                },
                email: parent2 + "@parent.com"
              });
              // Save the second parents
              UserController.createUser(newParent2, (err) => {
                if (err) throw err;
                newStudent.parent1 = newParent1._id;
                newStudent.parent2 = newParent2._id;
                Student.update({ _id: newStudent._id }, newStudent, (err) => {
                  if (err) throw err;
                });
              });
            });
          });
        }
      });
    });
  }
}


module.exports.seedAttendance = () => {
  let months = ['September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'];
  let statusTypes = ["present", "late"]

  SchoolClass.find({}, (err, schoolClasses) => {
    for (let j = 0; j < schoolClasses.length; j++) {
      let schoolClass = schoolClasses[j];
      Student.find({ schoolClass: schoolClass._id }, (err, students) => {
        let year = "2017";
        for (let m = 0; m < months.length; m++) {
          let roll = [];
          for (let s = 0; s < students.length; s++) {
            let student = students[s];
            let statusTypeIndex = Math.floor(Math.random() * 2);
            roll.push({ student: student._id, status: statusTypes[statusTypeIndex]});
          }
          let month = months[m];
          if (month === "January") year = "2018";
          for (let i = 0; i < 20; i++) {
            let day = i + 1;
            let dateStr = month + " " + day + ", " + year;
            let newAttendance = new Attendance({
              schoolClass: schoolClass._id,
              date: Date.parse(dateStr),
              roll: roll
            });
            newAttendance.save((err) => {
              if (err) throw err;
            })
          }
        }
      });
    }
  });
}
