const { query } = require("express");

const getAllPontosColetas = async ( req, res ) => {
    const { pool } = req;
    const { id, nome, tipo, descricao, nome_cidade, nome_estado } = req.query;

    let filtros = [];
    let values = [];
    let index = 1;

    if (id) {
        filtros.push(`pc.id = $${index}`);
        values.push(id);
        index++;
    }

    if (nome) {
        filtros.push(`pc.nome ilike $${index}`);
        values.push(`%${nome}%`);
        index++;
    }

    if (tipo) {
        filtros.push(`pc.tipo ilike $${index}`);
        values.push(`%${tipo}%`);
        index++;
    }

    if (descricao) {
        filtros.push(`descricao ilike $${index}`);
        values.push(`%${descricao}%`);
        index++;
    }

    if (nome_cidade) {
        filtros.push(`c.nome ilike $${index}`);
        values.push(`%${nome_cidade}%`);
        index++;
    }

    if (nome_estado) {
        filtros.push(`e.nome ilike $${index}`);
        values.push(`%${nome_estado}%`);
        index++;
    }

    const existeFiltros = filtros.length > 0;

    const query = `SELECT pc.id, 
                          pc.nome, 
                          latitude, 
                          longitude, 
                          tipo, 
                          descricao,
                          id_cidade as id_cidade, 
                          c.nome as nome_cidade,
                          e.id as id_estado,
                          e.nome as nome_estado
                     FROM public.pontos_coleta as pc
                left join cidades as c 
                       on c.id = pc.id_cidade
                left join estados as e
                       on e.id = c.id_estado
${existeFiltros ? ' WHERE ' + filtros.join(' AND ') : ''} 
                    order by id` 

    try {
        const result = await pool.query(query,values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Erro ao buscar pontos de coleta'});
    }
};

const postPontosColeta = async ( req, res) => {
    const { pool } = req;
    const { id_cidade, nome, latitude, longitude, tipo, descricao } = req.body;

    try {
        const result = await pool.query(
            'insert into pontos_coleta (id_cidade, nome, latitude, longitude, tipo, descricao) values ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id_cidade, nome, latitude, longitude, tipo, descricao]
        )
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao inserir ponto de coleta' })
    }

}

const deletePontosColeta = async ( req, res) => {
    const { pool } = req;
    const { id } = req.params;

    try {
        const result = await pool.query(
            'delete from pontos_coleta where id=$1',
            [id]
        )

        // Se a exclusão for bem-sucedida, o `result.rowCount` será maior que 0
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ponto de coleta não encontrado' });
        }

        res.status(200).json({message: 'Ponto de coleta excluído com sucesso!'})
    } catch ( error ){
        console.error(error);
        res.status(500).json({message: 'Erro ao deletar ponto de coleta'})
    }
}

const putPontosColeta = async ( req, res ) => {
    const { pool } = req;
    const { id } = req.params;
    const { id_cidade, nome, latitude, longitude, tipo, descricao } = req.body;

    // Vamos montar o conjunto de atualizações dinamicamente
    let updates = [];
    let values = [];
    let index = 1;

    // Adiciona os campos ao conjunto de atualização, se foram passados na requisição
    if (id_cidade) {
        updates.push(`id_cidade = $${index}`);
        values.push(id_cidade);
        index++;
    }
    if (nome) {
        updates.push(`nome = $${index}`);
        values.push(nome);
        index++;
    }
    if (latitude) {
        updates.push(`latitude = $${index}`);
        values.push(latitude);
        index++;
    }
    if (longitude) {
        updates.push(`longitude = $${index}`);
        values.push(longitude);
        index++;
    }
    if (tipo) {
        updates.push(`tipo = $${index}`);
        values.push(tipo);
        index++;
    }
    if (descricao) {
        updates.push(`descricao = $${index}`);
        values.push(descricao);
        index++;
    }

    // Se não houver dados para atualizar, retorna erro
    if (updates.length === 0) {
        return res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização' });
    }

    // Adiciona o ID na última posição do array de valores
    values.push(id);

    // Construir a consulta SQL dinamicamente
    const query = `UPDATE pontos_coleta SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;

    try{
        const result = await pool.query(query,values);

        // Se a atualização for bem-sucedida, o `result.rowCount` será maior que 0
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario não encontrado' });
        }

        // Responde com os dados do usuário atualizado
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao editar ponto de coleta' })
    }
}

module.exports = { getAllPontosColetas, postPontosColeta, deletePontosColeta, putPontosColeta };
