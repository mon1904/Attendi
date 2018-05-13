

module.exports.validateRequest = (schoolClassRequest) => {
  schoolClassRequest.checkBody('teacher', 'Teacher must be selected').notEmpty();
  schoolClassRequest.checkBody('name', 'Name must be selected').notEmpty();

  var errors = schoolClassRequest.validationErrors();

  if(errors){
    console.log('Errors');
  } else{
    console.log('No Errors')
  }
  return schoolClassRequest.validationErrors();

}
