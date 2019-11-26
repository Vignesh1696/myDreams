
import express from 'express';
import controller from './appClientController';

var router = express.Router();

router.post('/create',controller.create);


module.exports = router;
