const express = require('express');
const router = express.Router();
const { getAllEstados, postEstado, deleteEstado, putEstado } = require('../controllers/estadosController');
const {autentificacao} = require("../Controllers/loginController");

router.get('/', getAllEstados);
router.post('/',autentificacao, postEstado);
router.delete('/:id',autentificacao, deleteEstado);
router.put('/:id',autentificacao, putEstado)

module.exports = router;
