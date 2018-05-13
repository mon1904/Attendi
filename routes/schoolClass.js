const express = require('express');
const router = express.Router();
const {middleware} = require('./util/lib');
const StudentController = require('../controllers/students');
const UserController = require('../controllers/user');
const SchoolClassValidator = require('../validation/schoolClass');
const {SchoolClass} = require('../models/schoolClass');

router.get('/', middleware.ensureAdmin, (req, res, next) => {
  SchoolClass.find({}, (err, schoolClasses) => {
    res.render('schoolClass/list', {
      title: "School Classes",
      schoolClasses: schoolClasses
    });
  });
});

router.get('/teacher', (req, res, next) => {
  let user = req.user;
  SchoolClass.findOne({teacher: user._id}, (err, schoolClass) => {
      if(err) throw err;
      if(schoolClass === undefined || schoolClass === null) {
        res.redirect('/');
      } else {
        StudentController.findBySchoolClassId(schoolClass._id, (model) => {
            res.render('schoolClass/info', {
                teacher: user,
                students: model.students
            });
        });
      }
  });
});


router.get('/add', middleware.ensureAdmin, (req, res, next) => {
  UserController.findTeachers((err, teachers) => {
    if(err) throw err;
    res.render('schoolClass/add', {
      title: "Add New Class",
      teachers: teachers
    });
  })
});

router.post('/add', middleware.ensureAdmin, (req, res, next) => {
  let errors = SchoolClassValidator.validateRequest(req);

  if(errors) {
    console.log(errors);
    UserController.findTeachers((err, teachers) => {
      if(err) throw err;
      res.render('schoolClass/add', {
        title: "Add New Class",
        errors: errors,
        teachers: teachers
      });
    })
  } else {
    let newSchoolClass = new SchoolClass({
      teacher: req.body.teacherId,
      name: req.body.name
    });

    newSchoolClass.save((err) => {
      if(err) throw err;
      res.redirect('/school-classes/');
    });

  }
});

router.get('/:id', (req, res, next) => {
  SchoolClass.findById(req.params.id, (err, schoolClass) => {
    if(err) throw err;
    StudentController.findBySchoolClassId(req.params.id, (model) => {
      UserController.findTeacherById(schoolClass.teacher, (err, teacher) => {
        if(err) throw err;
        res.render('schoolClass/info', {
          teacher: teacher,
          students: model.students,
          schoolClass: schoolClass
        });
      });
    });
  });
});

router.get('/:id/teacher/set', middleware.ensureAdmin, (req, res, next) => {
  SchoolClass.findById(req.params.id, (err, schoolClass) => {
    if(err) throw err;
    UserController.findTeachers((err, teachers) => {
      if(err) throw err;
      if(schoolClass.teacher !== undefined || schoolClass.teacher !== null) {
        let foundTeacher = null;
        for(let teacher in teachers) {
          if(teacher._id === schoolClass.teacher) {
            foundTeacher = teacher;
            break;
          }
        }
        res.render('schoolClass/set-teacher', {
          schoolClass: schoolClass,
          currentTeacher: foundTeacher,
          teachers: teachers
        });
      }
    });
  });
});

router.post('/:id/teacher/set', middleware.ensureAdmin, (req, res, next) => {
  SchoolClass.findById(req.params.id, (err, schoolClass) => {
    if(err) throw err;
    schoolClass.teacher = req.body.teacher;
    schoolClass.save((err) => {
      if(err) throw err;
      res.redirect('/school-classes/')
    })
  });
});

module.exports = router;
