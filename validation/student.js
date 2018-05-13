
module.exports.validateRequest = (studentReq) => {
  studentReq.checkBody('firstname','First name field is required').notEmpty();
  studentReq.checkBody('lastname','Last name field is required').notEmpty();
  studentReq.checkBody('gender','Gender is not valid').notEmpty();
  studentReq.checkBody('address','Address is required').notEmpty();
  studentReq.checkBody('dob','Date of birth field is required').notEmpty();
  studentReq.checkBody('pps','PPS field is required').notEmpty();
  studentReq.checkBody('doctorName','Doctor name field is required').notEmpty();
  studentReq.checkBody('doctorPhone','Doctor phone field is required').notEmpty();

  return studentReq.validationErrors();

};
