var express = require('express');
var router = express.Router();
var {
  SchoolClass
} = require('../models/schoolClass');
var {
  Attendance
} = require('../models/attendance');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


function getAttendanceStats(schoolClass, res) {
  let statsModel = [];

  Attendance.find({
    schoolClass: schoolClass._id
  }, null, {
      sort: {
        date: 1
      }
    }, (err, attendances) => {
      let month = attendances[0].date.getMonth();

      let absentStore = new Object();
      for (let j = 0; j < attendances.length; j++) {
        let attendance = attendances[j];
        // total roll of students
        let totalRoll = attendance.roll.length;
        // Get month of current attendance entry
        let cMonth = attendance.date.getMonth();
        if (cMonth !== month) {
          let monthStr = MONTHS[month];
          let totalAbsent = Object.keys(absentStore).length;
          statsModel.push({
            month: monthStr,
            totalNo: totalRoll,
            totalAbsent: totalAbsent,
            totalPresent: totalRoll - totalAbsent,
            absentPercent: (totalAbsent / totalRoll) * 100
          });
          absentStore = new Object();
          month = cMonth;
        }

        // Calculate total present for second column
        let totalPresent = 0;

        for (let r = 0; r < attendance.roll.length; r++) {
          let roll = attendance.roll[r];
          if (roll.status === 'absent') {
            absentStore[roll.student.toString()] = true;
          }
        }
        // Handle final month 
        // This is needed because loop compares the previous month with the next month, but June is the last month so cant compare to anything
        if(j === attendances.length -1) {
          let monthStr = MONTHS[month];
          let totalAbsent = Object.keys(absentStore).length;
          statsModel.push({
            month: monthStr,
            totalNo: totalRoll,
            totalAbsent: totalAbsent,
            totalPresent: totalRoll - totalAbsent,
            absentPercent: (totalAbsent / totalRoll) * 100
          });
        }
      }
      res.render('stats/class-attendance', {
        statsModel: statsModel
      });
    });
}


router.get('/teacher/:id', (req, res, next) => {
  SchoolClass.findOne({ teacher: req.params.id }, (err, schoolClass) => {
    if (err) throw err;
    getAttendanceStats(schoolClass, res);
  });
});

router.get('/school-class/:id', (req, res, next) => {
  SchoolClass.findById(req.params.id, (err, schoolClass) => {
    if(err) throw err;
    getAttendanceStats(schoolClass, res);
  });
});


module.exports = router;
