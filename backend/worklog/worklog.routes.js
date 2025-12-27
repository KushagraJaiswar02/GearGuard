const express = require('express');
const router = express.Router();
const worklogCtrl = require('./worklog.controller');

router.get('/', worklogCtrl.getLogs);
router.patch('/:id/start', worklogCtrl.startWork);
router.patch('/:id/stop', worklogCtrl.stopWork);

module.exports = router;