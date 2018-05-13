var express = require('express');
var router = express.Router();
var UserController = require('../controllers/user');
var { User } = require('../models/user');
var { Message } = require('../models/message');

router.get('/parent', (req, res, next) => {
    UserController.findParents((err, parents) => {
        if (err) throw err;
        Message.find({ teacher: req.user._id }, (err, messages) => {
            if (err) throw err;
            for (let m = 0; m < messages.length; m++) {
                let message = messages[m];
                for (let p = 0; p < parents.length; p++) {
                    if (message.parent.equals(parents[p]._id)) {
                        parents[p].notifCnt = message.teacherNotificationCount;
                    }
                }
            }
            res.render('messages/parents', {
                parents: parents
            });
        });
    })
});

router.get('/parent/:id', (req, res, next) => {
    UserController.findParentById(req.params.id, (err, parent) => {
        if (err) throw err;
        Message.findOne({ teacher: req.user._id, parent: req.params.id }, (err, message) => {
            if (err) throw err;
            let messageStack = [];
            if (message !== undefined && message !== null) {
                messageStack = message.messageStack;
                message.save((err) => {
                    if (err) throw err;
                    res.render('messages/message', {
                        pMessages: messageStack,
                        user2: parent
                    });
                });
            } else {
                res.render('messages/message', {
                    pMessages: messageStack,
                    user2: parent
                });
            }
        });
    });
});

// This is the exact same as the router.get('/parent') with the roles reversed.
router.get('/teacher', (req, res, next) => {
    UserController.findTeachers((err, teachers) => {
        if (err) throw err;
        Message.find({ parent: req.user._id }, (err, messages) => {
            if (err) throw err;

            for (let m = 0; m < messages.length; m++) {
                let message = messages[m];
                for (let t = 0; t < teachers.length; t++) {
                    if (message.teacher.equals(teachers[t]._id)) {
                        teachers[t].notifCnt = message.parentNotificationCount;
                    }
                }
            }
            res.render('messages/teachers', {
                teachers: teachers
            });
        });
    });
});

// This is the exact same as the router.get('/parent/:id'). Just with the roles reversed.
router.get('/teacher/:id', (req, res, next) => {
    UserController.findTeacherById(req.params.id, (err, teacher) => {
        if (err) throw err;
        console.log({ parent: req.user._id, teacher: req.params.id });
        Message.findOne({ parent: req.user._id, teacher: req.params.id }, (err, message) => {
            if (err) throw err;
            let messageStack = [];
            if (message !== undefined && message !== null) {
                messageStack = message.messageStack;
                message.parentNotificationCount = 0;
                message.save((err) => {
                    if (err) throw err;
                    res.render('messages/message', {
                        pMessages: messageStack,
                        user2: teacher
                    });
                });
            } else {
                res.render('messages/message', {
                    pMessages: messageStack,
                    user2: teacher
                });
            }
        });
    });
});


router.post('/teacher/:id/', (req, res, next) => {
    Message.findOne({ parent: req.user._id, teacher: req.params.id }, (err, message) => {
        if (err) throw err;
        if (message !== undefined && message !== null) {
            message.messageStack.push({ message: req.body.message, senderRole: 'parent' });
            message.teacherNotificationCount = (message.teacherNotificationCount !== undefined && message.teacherNotificationCount !== null) ? message.teacherNotificationCount : 0;
            message.teacherNotificationCount = message.teacherNotificationCount +  1;
            message.save((err) => {
                if (err) throw err;
                res.redirect('/messages/teacher/' + req.params.id);
            });
        } else {
            let messageStack = [];
            messageStack.push({ message: req.body.message, senderRole: 'parent' });
            let message = new Message({
                teacher: req.params.id,
                parent: req.user._id,
                messageStack: messageStack,
                teacherNotificationCount: 1
            });
            message.save((err) => {
                if (err) throw err;
                res.redirect('/messages/teacher/' + req.params.id);
            });
        }
    });
});

// This is the same as post('/teacher/:id') with roles reversed.
router.post('/parent/:id/', (req, res, next) => {

    Message.findOne({ teacher: req.user._id, parent: req.params.id }, (err, message) => {
        if (err) throw err;
        if (message !== undefined && message !== null) {
            message.messageStack.push({ message: req.body.message, senderRole: 'teacher' });
            message.parentNotificationCount = (message.parentNotificationCount !== undefined && message.parentNotificationCount !== null) ? message.parentNotificationCount : 0;
            message.parentNotificationCount = message.parentNotificationCount +  1;
            message.save((err) => {
                if (err) throw err;
                res.redirect('/messages/parent/' + req.params.id);
            });
        } else {
            let messageStack = [];
            messageStack.push({ message: req.body.message, senderRole: 'teacher' });
            let message = new Message({
                parent: req.params.id,
                teacher: req.user._id,
                messageStack: messageStack,
                parentNotificationCount: 1
            });
            message.save((err) => {
                if (err) throw err;
                res.redirect('/messages/parent/' + req.params.id);
            });
        }
    });
});

module.exports = router;
