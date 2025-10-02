const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser); // PUT
router.delete('/users/:id', userController.deleteUser); // DELETE
<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 7bd3716efe8b17ca4907bac89a574f582add9748
