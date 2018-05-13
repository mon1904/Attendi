const {Student} = require('../models/student');
var moment = require('moment');

var dob = moment().format('MM Do YY')

module.exports.findBySchoolClassId = (schoolClassId, callback) => {
    Student.find({schoolClass: schoolClassId}, (err, students) => {
        if(err) throw err;
        callback({students: students, schoolClassId: schoolClassId});
    });
};

module.exports.requestBodyToModel = (reqBody) => {
    return {
        details: {
          firstname: reqBody.firstname,
          lastname: reqBody.lastname,
          gender: reqBody.gender,
          address: reqBody.address,
        },
        pps: reqBody.pps,
        dob: reqBody.dob,
        doctorName: reqBody.doctorName,
        doctorPhone: reqBody.doctorPhone,
      }
      console.log(dob)
}
