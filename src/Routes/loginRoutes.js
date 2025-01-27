const express = require('express');
const router = express.Router();
const { login } = require('../controllers/loginController');

// Rota para obter todos os usuários
router.post('/', login);

module.exports = router;
