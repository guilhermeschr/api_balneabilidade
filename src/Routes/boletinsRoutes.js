const express = require('express');
const router = express.Router();
const { getAllBoletins, postBoletim, deleteBoletim, putBoletim } = require('../controllers/boletinsController');
const {autentificacao} = require("../Controllers/loginController");

router.get('/',getAllBoletins);
router.post('/',autentificacao, postBoletim);
router.delete('/:id',autentificacao, deleteBoletim);
router.put('/:id',autentificacao, putBoletim);

module.exports = router;