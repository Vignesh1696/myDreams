'use strict';

import express from 'express';
import controller from './userController';
import auth from '../../auth/auth-service'
var router = express.Router();

router.post('/create', controller.create);
router.get('/me', auth.isTalent(), controller.me);
router.post('/login', controller.login);
router.post('/refresh-token', controller.refreshToken);
router.post('/logout', auth.isTalent(), controller.logout);


module.exports = router;