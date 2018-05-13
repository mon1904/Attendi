var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var { middleware } = require('./util/lib');
var UserValidation = require('../validation/user');
var UserController = require('../controllers/user');
var { User } = require('../models/user');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(function (username, password, done) {
    UserController.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        if (!user) {
            return done(null, false, { message: 'Unknown User' });
        }

        UserController.comparePassword(password, user.password, function (err, isMatch) {
            if (err) return done(err);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid Password' });
            }
        });
    });
}));

router.get('/login', (req, res, next) => {
    res.render('auth/login', {
        title: 'Login'
    });
});

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }), (req, res) => {
        req.flash('success', 'You are now logged in');
        res.redirect('/');
});


router.get('/register', (req, res, next) => {
    res.render('auth/register', {
        title: 'Add User'
    });
});

router.post('/register', (req, res, next) => {
    let errors = UserValidation.validateRequest(req);

    if (errors) {
        res.render('auth/register', {
            title: 'Add User',
            errors: errors
        });
    } else {
        let newUser = new User(UserController.requestBodyToModel(req.body));
        UserController.createUser(newUser, (err, user) => {
            if (err) throw err;
            req.flash('success', 'The profile is created successfully');
            res.redirect('/');
        });
    }
});

router.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('/users/login');
});

router.get('/edit/:id', middleware.canCRUDUser, (req, res, next) => {
    User.findById(req.params.id, (err, user) => {
        res.render('auth/edit', {
            title: 'Edit User Profile',
            profile: user
        });
    });
});

router.post('/edit/:id', middleware.canCRUDUser, (req, res, next) => {
    let errors = UserValidation.validateRequest(req);
    let user = UserController.requestBodyToModel(req.body);
    if (errors) {
        res.render('auth/edit', {
            title: 'Edit User Profile',
            profile: user,
            user: user
        });
    } else {
        if(req.user.password !== user.password) {
            UserController.hashPassword(user.password, (err, hash) => {
                user.password = hash;
                User.update({ _id: req.params.id }, user, (err) => {
                    if (err) throw err;
                    req.flash('success', 'User Profile Updated');
                    res.redirect('/');
                });
            });
        } else {
            User.update({ _id: req.params.id }, user, (err) => {
                if (err) throw err;
                req.flash('success', 'User Profile Updated');
                res.redirect('/');
            });
        }
    }
});

router.get('/delete/:id', middleware.canCRUDUser, (req, res, next) => {
    User.remove({ _id: req.params.id }, (err) => {
        if (err) throw err;
        req.flash('Success', 'User Profile Deleted');
        res.send('Success');
    });
});

router.get('/teachers', middleware.ensureAdmin, (req, res, next) => {
    UserController.findTeachers((err, teachers) => {
        if (err) throw err;
        res.render('auth/teachers', {
            teachers: teachers
        });
    });
});

router.get('/parents', middleware.ensureAdmin, (req, res, next) => {
    UserController.findParents((err, parents) => {
        if (err) throw err;
        res.render('auth/parents', {
            parents: parents
        });
    });
});

router.get('/view/:id', (req, res, next) => {

    User.findById(req.params.id, (err, user) => {
        if(err) throw err;
        res.render('auth/view', {
          title: 'User',
          profile: user
        });
    });
});


module.exports = router;
