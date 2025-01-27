const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const secreto = process.env.JWT_SECRET;

const login = async (req, res) => {
    const { pool } = req;
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    try{
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        let validPassword = await bcrypt.compare(senha, user.senha);

        if (!validPassword) {
            return res.status(401).json({error: 'Senha inválida'});
        }

        const token = jwt.sign({ id: user.id, username: user.username }, secreto, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login bem-sucedido', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar login' });
    }
}

const autentificacao = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({error: 'Token não fornecido ou inválido'});
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, secreto, (err, decoded) => {
        if (err) {
            return res.status(401).json({error: 'Token inválido'});
        }
        req.user = decoded;
        next();
    });
};

module.exports = { login, autentificacao };

