const express = require('express');
const router = express.Router();
const { getAllCidades, postCidade, deleteCidade, putCidade } = require('../controllers/cidadesController');
const {autentificacao} = require("../Controllers/loginController");

router.get('/', getAllCidades);
router.post('/',autentificacao, postCidade);
router.delete('/:id',autentificacao, deleteCidade);
router.put('/:id',autentificacao, putCidade);

module.exports = router;
