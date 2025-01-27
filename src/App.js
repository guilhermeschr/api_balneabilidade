require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg'); // Importa o Pool do pg para gerenciar conexões

const userRoutes = require('./routes/userRoutes');
const estadosRoutes = require('./routes/estadosRoutes');
const cidadesRoutes = require('./routes/cidadesRoutes');
const pontosColetasRoutes = require('./routes/pontosColetasRoutes');
const campanhasbalneamentoRoutes = require('./routes/campanhasbalneamentoRoutes');
const boletinsRoutes = require('./routes/boletinsRoutes');
const loginRoutes = require('./routes/loginRoutes');



// Cria uma instância do servidor Express
const app = express();

// Configurações
app.use(cors());
app.use(bodyParser.json());

// Configurações do banco de dados PostgreSQL usando Pool
const pool = new Pool({
    user: process.env.DB_USER,        // Usuário do banco
    host: process.env.DB_HOST,        // Host do banco de dados
    database: process.env.DB_DATABASE,// Nome do banco de dados
    password: process.env.DB_PASSWORD,// Senha do banco
    port: process.env.DB_PORT,        // Porta padrão do PostgreSQL
});

// Middleware para acessar o pool nas rotas
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

// Roteamento
app.use('/api/usuarios', userRoutes);
app.use('/api/estados', estadosRoutes);
app.use('/api/cidades', cidadesRoutes);
app.use('/api/pontoscoletas', pontosColetasRoutes);
app.use('/api/campanhasbalneamento', campanhasbalneamentoRoutes);
app.use('/api/boletins', boletinsRoutes);
app.use('/api/login',loginRoutes);

// Inicia o servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
