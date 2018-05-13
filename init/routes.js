const index = require('../routes/index');
const users = require('../routes/users');
const schoolClasses = require('../routes/schoolClass');
const attendance = require('../routes/attendance');
const students = require('../routes/students');
const messages = require('../routes/messaging');
const reports = require('../routes/reports');
const stats = require('../routes/statistics');
const graphs = require('../routes/graphs');
const parents = require('../routes/parents');

exports.setupRoutes = (app) => {
    app.use('/', index);
    app.use('/users', users);
    app.use('/school-classes', schoolClasses);
    app.use('/attendance', attendance);
    app.use('/students', students);
    app.use('/messages', messages);
    app.use('/reports', reports);
    app.use('/stats', stats);
    app.use('/parents', parents);
    app.use('/graphs', graphs);
}
