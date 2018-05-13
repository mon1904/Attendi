const {ROUTES} = require('./constants');
const {ROLES} = require('../../models/user');

exports.middleware = {
    ensureAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()) {
            return next();
        } else {
            res.redirect(ROUTES.LOGIN);
        }
    },

    // Checks if the user is an admin or the user is editing something they own.
    // So for editing profiles, an admin can do this or you can edit your own profile.
    canCRUDUser: (req, res, next) => {
        if(req.isAuthenticated()) {
            if(req.user.role === ROLES.ADMIN || req.user._id == req.params.id) {
                return next();
            }
        }
        res.redirect(ROUTES.INDEX);
    },
    ensureAdmin: (req, res, next) => {
        if(req.user.role === ROLES.ADMIN) {
            return next();
        } else {
            res.redirect(ROUTES.INDEX);
        }
    },
    ensureTeacher: (req, res, next) => {
        if(req.user.role === ROLES.TEACHER) {
            return next();
        } else {
            res.redirect(ROUTES.INDEX);
        }
    },
    ensureParent: (req, res, next) => {
        if(req.user.role === ROLES.PARENT) {
            return next();
        } else {
            res.redirect(ROUTES.INDEX);
        }
    }
}
