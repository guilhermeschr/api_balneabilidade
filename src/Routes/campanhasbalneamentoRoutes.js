const express = require('express');
const router = express.Router();
const { getAllCampanhas, postCampanha, deleteCampanha, putCampanha } = require('../controllers/campanhasBalneamentoController');
const {autentificacao} = require("../Controllers/loginController");

router.get('/', getAllCampanhas);
router.post('/',autentificacao, postCampanha);
router.delete('/:id',autentificacao, deleteCampanha);
router.put('/:id',autentificacao, putCampanha);

module.exports = router;