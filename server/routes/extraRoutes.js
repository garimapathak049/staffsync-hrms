const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const A = require('../controllers/announcementController');
const T = require('../controllers/trainingController');
const N = require('../controllers/notificationController');
const S = require('../controllers/analyticsController');

const ann = express.Router(); ann.use(authenticate);
ann.get('/', A.list); ann.get('/:id', A.get);
ann.post('/', authorize('HR'), [body('title').trim().notEmpty(), body('description').trim().notEmpty()], validate, A.create);
ann.put('/:id', authorize('HR'), A.update);
ann.patch('/:id/publish', authorize('HR'), A.publish);
ann.delete('/:id', authorize('HR'), A.remove);

const tr = express.Router(); tr.use(authenticate);
tr.get('/', T.list); tr.get('/:id', T.get);
tr.post('/', authorize('HR', 'MANAGER'), [body('title').trim().notEmpty(), body('instructor').trim().notEmpty(), body('description').trim().notEmpty(), body('startDate').isISO8601(), body('endDate').isISO8601(), body('capacity').isInt({ min: 1 })], validate, T.create);
tr.put('/:id', authorize('HR', 'MANAGER'), T.update);
tr.patch('/:id/status', authorize('HR', 'MANAGER'), [body('status').isIn(['Scheduled', 'Closed', 'Cancelled', 'Completed'])], validate, T.setStatus);
tr.post('/:id/enroll', authorize('EMPLOYEE', 'MANAGER'), T.enroll);
tr.delete('/:id/enroll', authorize('EMPLOYEE', 'MANAGER'), T.unenroll);

const no = express.Router(); no.use(authenticate);
no.get('/', N.list); no.patch('/read-all', N.readAll); no.patch('/:id/read', N.read);

const an = express.Router(); an.use(authenticate);
an.get('/hr', authorize('HR'), S.hr);
an.get('/manager', authorize('MANAGER'), S.manager);
an.get('/export/:type', authorize('HR'), S.exportCsv);

module.exports = { ann, tr, no, an };
