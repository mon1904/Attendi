const express = require('express');
const router = express.Router();
const {middleware} = require('./util/lib');
const StudentValidator = require('../validation/student');
const StudentController = require('../controllers/students');
const UserController = require('../controllers/user');
const {Student} = require('../models/student');
const {SchoolClass} = require('../models/schoolClass');

router.get('/', middleware.ensureAdmin, (req, res, next) => {
  Student.find({}, (err, students) => {
    res.render('students/list', {
      title: 'Students',
      students: students
    });
  });
});

router.get('/view/:id', middleware.ensureAdmin, (req, res, next) => {
  UserController.findParents((err, parents) => {
    Student.findById(req.params.id, (err, students) => {

        for(let p=0; p<parents.length; p++) {
          let parent = parents[p];
          if(students.parent1.equals(parent._id)) {
            students.parent1 = parent;
          } else if(students.parent2.equals(parent._id)) {
            students.parent2 = parent;
          }
        }
      res.render('students/view', {
        title: 'Students',
        students: students
      });
    });
  });
});

router.get('/add', middleware.ensureAdmin, (req, res, next) => {
  res.render('students/add', {
    title: 'Add Student',
  });
});

router.post('/add', middleware.ensureAdmin, (req, res, next) => {
  let errors = StudentValidator.validateRequest(req);

  if(errors) {
    res.redirect('/students/add', {
      title: 'Add New Student Profile',
      errors: errors
    });
  } else {
    let newStudent = new Student(StudentController.requestBodyToModel(req.body));
    newStudent.save((err) => {
      if(err) throw err;
      req.flash('success', 'The profile is created successfully');
      res.redirect('/students/')
    });
  }
});

router.get('/edit/:id', middleware.ensureAdmin, (req, res, next) => {
  Student.findById(req.params.id, (err, student) => {
    if(err) throw err;
    UserController.findParents((err, parents) => {
      if(err) throw err;
      SchoolClass.find({}, (err, schoolClasses) => {
        if(err) throw err;
        res.render('students/edit', {
          title: 'Edit Student Profile',
          student: student,
          schoolClasses: schoolClasses,
          parents: parents
        });
      });
    });
  });
});

router.post('/edit/:id', middleware.ensureAdmin, (req, res, next) => {
  let errors = StudentValidator.validateRequest(req);
  if(errors) {
    res.render('students/edit', {
      title: 'Edit Student Profile',
      errors: errors
    });
  } else {
    Student.update({_id: req.params.id}, StudentController.requestBodyToModel(req.body), (err) => {
      if(err) throw err;
      req.flash('success', 'Student Profile Updated');
      res.redirect('/students/');
    });
  }
});

router.get('/delete/:id', middleware.ensureAdmin, (req, res, next) => {
  Student.remove({_id: req.params.id}, (err, student) => {
    res.redirect('/students/');
  });
});

module.exports = router;
