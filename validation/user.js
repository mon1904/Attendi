
module.exports.validateRequest = (userRequest) => {
  userRequest.checkBody('email','Email field is required').notEmpty();
  userRequest.checkBody('email','Email is not valid').isEmail();
  userRequest.checkBody('username','Username field is required').notEmpty();
  userRequest.checkBody('password','Password field is required').notEmpty();
  userRequest.checkBody('password2','Passwords do not match').equals(userRequest.body.password);
  userRequest.checkBody('role','Role field is required').notEmpty();


  var errors = userRequest.validationErrors();

  if(errors){
    console.log('Errors');
  } else{
    console.log('No Errors')
  }
  return userRequest.validationErrors();
}
