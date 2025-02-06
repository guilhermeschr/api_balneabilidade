const bcrypt = require('bcrypt');


const getAllUsers = async (req, res) => {
    const { pool } = req; // Pega o pool de conexões do banco de dados
    const { id, nome, email } = req.query;

    let filtros = [];
    let values = [];
    let index = 1;

    if (id) {
        filtros.push(`id = $${index}`);
        values.push(id);
        index++;
    }

    if (nome) {
        filtros.push(`nome ilike $${index}`);
        values.push(`%${nome}%`);
        index++;
    }

    if (email) {
        filtros.push(`email ilike $${index}`);
        values.push(`%${email}%`);
        index++;
    }

    const existeFiltros = filtros.length > 0;

    const query =     `SELECT * 
                         FROM usuarios 
    ${existeFiltros ? ' WHERE ' + filtros.join(' AND ') : ''} 
                        order by id`;


    try {
        const result = await pool.query(query,values);

        res.status(200).json(result.rows); // Envia a lista de usuários
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
};

const createUser = async (req, res) => {
    const { pool } = req; // Pega o pool de conexões do banco de dados
    const { nome, email, senha } = req.body; // Pega os dados do usuário no corpo da requisição

    if (!nome || !senha || !email) {
        return res.status(400).json({ error: 'Preencha todos os campos' });
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
            [ nome, email, hashedPassword]
        );
        res.status(201).json(result.rows[0]); // Retorna o usuário criado
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Usuário já existe' });
        }
        console.error(error);
        res.status(500).json({ message: 'Erro ao inserir usuário' });
    }
};

const deleteUser = async ( req, res ) => {
    const { pool } = req;
    const { id } = req.params;

    try{
        const result = await pool.query(
            'delete from usuarios where id = $1 RETURNING *',
            [id]
        )

        // Se a exclusão for bem-sucedida, o `result.rowCount` será maior que 0
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario não encontrado' });
        }

        res.status(200).json({message: 'Usuario excluído com sucesso!'})
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Erro ao deletar usuario'})
    }
}

const putUser = async (req, res) =>{
    const { pool } = req;
    const { id } = req.params;
    const { nome, email, senha } = req.body;

    // Vamos montar o conjunto de atualizações dinamicamente
    let updates = [];
    let values = [];
    let index = 1;

    // Adiciona os campos ao conjunto de atualização, se foram passados na requisição
    if (nome) {
        updates.push(`nome = $${index}`);
        values.push(nome);
        index++;
    }
    if (email) {
        updates.push(`email = $${index}`);
        values.push(email);
        index++;
    }
    if (senha) {
        updates.push(`senha = $${index}`);
        values.push(senha);
        index++;
    }

    // Se não houver dados para atualizar, retorna erro
    if (updates.length === 0) {
        return res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização' });
    }

    // Adiciona o ID na última posição do array de valores
    values.push(id);

    // Construir a consulta SQL dinamicamente
    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;

    try {
        const result = await pool.query(query,values);

        // Se a atualização for bem-sucedida, o `result.rowCount` será maior que 0
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario não encontrado' });
        }

        // Responde com os dados do usuário atualizado
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao editar usuario' });
    }

}


module.exports = { getAllUsers, createUser, deleteUser, putUser };
