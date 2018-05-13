const express = require('express');
const router = express.Router();
const {middleware} = require('./util/lib');
const StudentValidator = require('../validation/student');
const StudentController = require('../controllers/students');
const UserController = require('../controllers/user');
const {Student} = require('../models/student');
const {SchoolClass} = require('../models/schoolClass');

router.get('/:id/students', (req, res, next) => {
  Student.find({$or: [{parent1: req.params.id}, {parent2: req.params.id}]}, (err, students) => {
      if(err) throw err;
    res.render('parents/student-list', {
      title: 'Students',
      students: students
    });
  });
});

module.exports = router;
