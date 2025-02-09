const express = require('express');
const router = express.Router();
const { login } = require('../controllers/loginController');
const {autentificacao} = require("../Controllers/loginController");

// Rota para obter todos os usuários
router.post('/', login);
router.post('/valida', autentificacao);

module.exports = router;
