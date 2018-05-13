var express = require('express');
var router = express.Router();
var {
  middleware
} = require('./util/lib');
var {
  seed,
  seedAttendance
} = require('../controllers/seeder');
var {
  Student
} = require('../models/student');
var {
  studentsToMonitor
} = require('../controllers/attendance');
var {
  Message
} = require('../models/message');

/* GET home page. */


router.all('*', (req, res, next) => {
  if (req.user !== undefined && (req.user.role === "parent" || req.user.role === "teacher")) {
    let query;
    if (req.user.role === "parent") {
      query = {
        parent: req.user._id
      };
    } else if (req.user.role === "teacher") {
      query = {
        teacher: req.user._id
      };
    }
    Message.find(query, (err, messages) => {
      console.log(messages);
      if (err) throw err;
      let notifCnt = 0;
      for (let i = 0; i < messages.length; i++) {
        if (req.user.role === "parent") {
          notifCnt += messages[i].parentNotificationCount;
        } else if (req.user.role === "teacher") {
          console.log(messages[i]);
          notifCnt += messages[i].teacherNotificationCount;
        }
      }
      res.locals.notifCnt = notifCnt;
      next();
    });
  } else {
    next();
  }
});


router.get('/birthdays', (req, res, next) => {
  Student.find({}, (err, students) => {
    if (err) throw err;
    for (let i = 0; i < students.length; i++) {
      let student = students[i];
      let birthdayStart = new Date(2014, student.dob.getMonth(), student.dob.getDate());
      student.dob = birthdayStart;
      student.save((err) => {

      })
    }
  });
});


router.get('/', middleware.ensureAuthenticated, (req, res, next) => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;

  if (req.user.role === 'teacher' || req.user.role === 'admin') {

    let birthdays = [];
    Student.find({}, (err, students) => {
      if (err) throw err;
      for (let i = 0; i < students.length; i++) {
        let student = students[i];
        let today = new Date();
        let birthdayStart = new Date(student.dob.getFullYear(), today.getMonth(), today.getDate());
        let birthdayEnd = new Date(birthdayStart.getFullYear(), birthdayStart.getMonth(), birthdayStart.getDate() + 7)
        if ((student.dob.getTime() <= birthdayEnd.getTime() && student.dob.getTime() >= birthdayStart.getTime())) {
          birthdays.push(student);
        }
      }
      studentsToMonitor((studentsToMonitor) => {
        res.render('index', {
          notices: true,
          birthdays: birthdays,
          studentsToMonitor: studentsToMonitor
        })
      });
    });
  } else {
    res.render('index', {
      notices: false
    });
  }
});

router.get('/seed', (req, res, next) => {
  seed();
  res.redirect('/');
});
router.get('/seed-a', (req, res, next) => {
  seedAttendance();
  res.redirect('/');
});

module.exports = router;
