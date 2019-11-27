'use strict';

import express from 'express';
import controller from './auth-controller';
import auth from '../../../auth/auth-service'

var router = express.Router();

router.post('/create', auth.isSuperAdmin(), controller.create);
router.get('/me', auth.isSuperAdmin(), controller.me);
router.post('/login', controller.login);
router.post('/refresh-token', controller.refreshToken);
router.post('/logout', auth.isSuperAdmin(), controller.logout);


module.exports = router;