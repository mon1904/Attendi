var express = require('express');
var router = express.Router();
var {middleware} = require('./util/lib');
var StudentController = require('../controllers/students');
var AttendanceController = require('../controllers/attendance');
const { SchoolClass } = require('../models/schoolClass');
const {Attendance } = require('../models/attendance');
const { Student } = require('../models/student');


router.get('/school-class/:id/take', (req, res, next) => {
    StudentController.findBySchoolClassId(req.params.id, (model) => {
        res.render('attendance/take', model);
    });
});

router.post('/school-class/:id/take', (req, res, next) => {
    let studentRoll = AttendanceController.parseRollStatus(req.body);
    AttendanceController.createAttendance(studentRoll, req.params.id, (attendance, err) => {
        if(err) throw err;
        req.flash('success', 'Rollcall taken');
        res.redirect('/');
    })
});

router.get('/teacher', (req, res, next) => {
  let user = req.user;
  SchoolClass.findOne({teacher: user._id}, (err, schoolClass) => {
      if(err) throw err;
      if(schoolClass === undefined || schoolClass === null) {
        res.redirect('/');
      } else {
        StudentController.findBySchoolClassId(schoolClass._id, (model) => {
            res.render('attendance/take', model);
        });
      }
  });
});


router.get('/student/:id', (req, res, next) => {
    Student.findById(req.params.id, (err, student) => {
        if(err) throw err;
        Attendance.find({'roll.student': student._id }, null, { sort: { date: 1 } }, (err, attendances) => {
            if (err) throw err;

            let attendanceHistory = [];

            for (let j = 0; j < attendances.length; j++) {
                let attendance = attendances[j];
                for (let r = 0; r < attendance.roll.length; r++) {
                    let roll = attendance.roll[r];
                    if (roll.student.equals(student._id)) {
                        attendanceHistory.push(
                            {
                                status: roll.status,
                                date: attendance.date
                            }
                        );
                        break;
                    }
                }
            }
            res.render('attendance/student', {
                attendanceHistory: attendanceHistory
            });
        });
    });
});

module.exports = router;
