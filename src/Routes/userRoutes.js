const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser, putUser } = require('../controllers/userController');
const {autentificacao} = require("../Controllers/loginController");

// Rota para obter todos os usuários
router.get('/',autentificacao, getAllUsers);

// Rota para criar um novo usuário
router.post('/',autentificacao, createUser);

router.delete('/:id',autentificacao, deleteUser);

router.put('/:id',autentificacao, putUser)

module.exports = router;
