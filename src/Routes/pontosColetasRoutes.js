const express = require('express');
const router = express.Router();
const { getAllPontosColetas, postPontosColeta, deletePontosColeta, putPontosColeta } = require('../controllers/pontosColetasController');
const {autentificacao} = require("../Controllers/loginController");

// Rota para obter todos os usuários
router.get('/', getAllPontosColetas);
router.post('/',autentificacao, postPontosColeta);
router.delete('/:id',autentificacao, deletePontosColeta);
router.put('/:id',autentificacao, putPontosColeta);

module.exports = router;
