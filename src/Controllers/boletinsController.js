const getAllBoletins = async ( req, res ) => {
    const { pool } = req;
    const { data_coleta, qualidade_agua, observacao, nome_ponto_coleta, nome_campanha, nome_estado, nome_cidade, id } = req.query;

    let filtros = [];
    let values = [];
    let index = 1;

    if (id) {
        filtros.push(`b.id = $${index}`);
        values.push(id);
        index++;
    }
    if (data_coleta) {
        filtros.push(`data_coleta = $${index}`);
        values.push(data_coleta);
        index++;
    }

    if (qualidade_agua) {
        filtros.push(`qualidade_agua ilike $${index}`);
        values.push(`%${qualidade_agua}%`);
        index++;
    }

    if (observacao) {
        filtros.push(`observacao ilike $${index}`);
        values.push(`%${observacao}%`);
        index++;
    }

    if (nome_ponto_coleta) {
        filtros.push(`pc.nome ilike $${index}`);
        values.push(`%${nome_ponto_coleta}%`);
        index++;
    }

    if (nome_cidade) {
        filtros.push(`c.nome ilike $${index}`);
        values.push(`%${nome_cidade}%`);
        index++;
    }

    if (nome_campanha) {
        filtros.push(`cb.nome ilike $${index}`);
        values.push(`%${nome_campanha}%`);
        index++;
    }

    if (nome_estado) {
        filtros.push(`e.nome ilike $${index}`);
        values.push(`%${nome_estado}%`);
        index++;
    }

    const existeFiltros = filtros.length > 0;

    const query = `SELECT b.id,
                                 data_coleta, 
                                 qualidade_agua, 
                                 observacao, 
                                 b.id_ponto_coleta, 
                                 pc.nome as nome_ponto_coleta, 
                                 pc.descricao as descricao_ponto_coleta,
                                 pc.latitude as latitude,
                                 pc.longitude as longitude,
                                 b.id_usuario_criador, 
                                 u.nome as nome_criador, 
                                 b.id_campanha, 
                                 cb.nome as nome_campanha, 
                                 e.id as id_estado, 
                                 e.nome as nome_estado, 
                                 c.id as id_cidade, 
                                 c.nome as nome_cidade
                            FROM public.boletins AS b
                            JOIN pontos_coleta AS pc
                              ON b.id_ponto_coleta = pc.id
                       LEFT JOIN cidades AS c
                              ON pc.id_cidade = c.id
                       LEFT JOIN estados AS e
                              ON c.id_estado = e.id
                       LEFT JOIN usuarios AS u
                              ON u.id = b.id_usuario_criador
                       LEFT JOIN campanhas_balneamento AS cb
                              ON b.id_campanha = cb.id
       ${existeFiltros ? ' WHERE ' + filtros.join(' AND ') : ''}
                           order by data_coleta desc , b.id desc
    `;
    console.log(query)
    try {
        const result = await pool.query(query,values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({erro: 'Erro ao buscar os boletins'});
    }
}

const postBoletim = async ( req, res ) =>{
    const { pool } = req;
    const { data_coleta, qualidade_agua, observacao, id_ponto_coleta, id_usuario, id_campanha } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO boletins (data_coleta, qualidade_agua, observacao, id_ponto_coleta, id_usuario_criador, id_campanha) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [ data_coleta, qualidade_agua, observacao, id_ponto_coleta, id_usuario, id_campanha ]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao inserir boletim' });
    }
}

const deleteBoletim = async ( req, res ) => {
    const { pool } = req;
    const { id } = req.params;

    try {
        const result = await pool.query('delete from boletins where id = $1',[id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Boletim não encontrado' });
        }

        res.status(200).json( {message: 'Boletim excluído com sucesso!' })
    } catch ( error ) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar boletim' });
    }
}

const putBoletim = async ( req, res ) => {
    const { pool } = req;
    const { id } = req.params;
    const { data_coleta, qualidade_agua, observacao, id_ponto_coleta, id_usuario, id_campanha } = req.body;
    
    let updates = [];
    let values = [];
    let index = 1;

    if (data_coleta) {
        updates.push(`data_coleta = $${index}`);
        values.push(data_coleta);
        index++;
    }

    if (qualidade_agua) {
        updates.push(`qualidade_agua = $${index}`);
        values.push(qualidade_agua);
        index++;
    }

    if (observacao) {
        updates.push(`observacao = $${index}`);
        values.push(observacao);
        index++;
    }

    if (id_ponto_coleta) {
        updates.push(`id_ponto_coleta = $${index}`);
        values.push(id_ponto_coleta);
        index++;
    }

    if (id_usuario) {
        updates.push(`id_usuario_criador = $${index}`);
        values.push(id_usuario);
        index++;
    }

    if (id_campanha) {
        updates.push(`id_campanha = $${index}`);
        values.push(id_campanha);
        index++;
    }

    if(updates.length === 0){
        res.status(400).json({ message: "Nenhuma atualização informada" });
    }

    values.push(id);

    const query = `UPDATE boletins SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;

    try {
        const result = await pool.query(query,values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Boletim não encontrada' });
        }

        res.status(200).json(result.rows[0]);
    } catch ( error ) {
        console.error(error);
        res.status(500).json({message:'Erro ao editar boletim'})
    }
}

module.exports = { getAllBoletins, postBoletim, deleteBoletim, putBoletim };