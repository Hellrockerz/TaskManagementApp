const express = require('express');
const router = express.Router();
const auth = require("./auth");
const userController = require("./controller");

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/createTask', auth.verifyToken, userController.createTask);

router.get('/getTaksList', auth.verifyToken, userController.getTaksList);
router.get('/getTaskById', auth.verifyToken, userController.getTaskById);
router.get('/statistics', auth.verifyToken, userController.statistics);

router.put('/updateTaskById', auth.verifyToken, userController.updateTaskById);

router.delete('/deleteTask', auth.verifyToken, userController.deleteTask);

module.exports = router;