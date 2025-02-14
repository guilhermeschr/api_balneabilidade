const getAllCampanhas = async ( req, res ) => {
    const { pool } = req;
    const { id, nome_campanha, data_inicio, data_fim, nome_estado } = req.query;

    let filtros = [];
    let values = [];
    let index = 1;

    if (id) {
        filtros.push(`cb.id = $${index}`);
        values.push(id);
        index++;
    }

    if (nome_campanha) {
        filtros.push(`cb.nome ilike $${index}`);
        values.push(`%${nome_campanha}%`);
        index++;
    }
    if (data_inicio) {
        filtros.push(`data_inicio ilike $${index}`);
        values.push(`%${data_inicio}%`);
        index++;
    }
    if (data_fim) {
        filtros.push(`data_fim ilike $${index}`);
        values.push(`%${data_fim}%`);
        index++;
    }
    if (nome_estado) {
        filtros.push(`e.nome ilike $${index}`);
        values.push(`%${nome_estado}%`);
        index++;
    }

    const existeFiltros = filtros.length > 0;

    const query = `SELECT cb.id,
                          cb.nome AS campanha_nome,
                          cb.id_usuario_criador,
                          u.nome AS usuario_nome,
                          cb.data_inicio,
                          cb.data_fim,
                          cb.id_estado,
                          e.nome AS estado_nome
                     FROM public.campanhas_balneamento AS cb
                     JOIN usuarios AS u
                       ON cb.id_usuario_criador = u.id
                     JOIN estados AS e
                       ON cb.id_estado = e.id
${existeFiltros ? ' WHERE ' + filtros.join(' AND ') : ''}
                    ORDER BY cb.id`

    try{
        const result = await pool.query(query,values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Erro ao buscar campanhas de balneamento'})
    }

}

const getCampanhasValidas = async ( req, res ) => {
    const { pool } = req;

    const dataAtual = new Date().toISOString().split('T')[0]; // Formato: "YYYY-MM-DD"
    // const sql = `SELECT * FROM tabela `;
    const valores = [dataAtual];


    const query = `SELECT cb.id,
                          cb.nome AS campanha_nome,
                          cb.id_usuario_criador,
                          u.nome AS usuario_nome,
                          cb.data_inicio,
                          cb.data_fim,
                          cb.id_estado,
                          e.nome AS estado_nome
                     FROM public.campanhas_balneamento AS cb
                     JOIN usuarios AS u
                       ON cb.id_usuario_criador = u.id
                     JOIN estados AS e
                       ON cb.id_estado = e.id
                    WHERE cb.data_fim > $1 
                      AND cb.data_inicio < $1
                   ORDER BY cb.id`;
    console.log(query)
    console.log(dataAtual)

    try{
        const result = await pool.query(query,valores);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Erro ao buscar campanhas de balneamento'})
    }

}

const postCampanha = async ( req, res ) => {
    const { pool } = req;
    const { id_usuario, nome, data_inicio, data_fim, id_estado } = req.body;

    try {
        const result = await pool.query(
            'insert into campanhas_balneamento (id_usuario_criador, nome, data_inicio, data_fim, id_estado) values ($1,$2,$3,$4,$5) RETURNING *',
            [id_usuario, nome, data_inicio, data_fim, id_estado]
        )
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao inserir campanha de balneamento' });
    }

}

const deleteCampanha = async  ( req, res ) => {
    const { pool } = req;
    const { id } = req.params;

    try{
        const result = await pool.query(
            'delete from campanhas_balneamento where id = $1',
            [id]
        )

        // Se a exclusão for bem-sucedida, o `result.rowCount` será maior que 0
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Campanha não encontrada' });
        }

        res.status(200).json({message: 'Campanha de balneamento excluída com sucesso!'})

    } catch ( error ) {
        console.error(error);
        res.status(500).json({message: 'Erro ao deletar campanha de balneamento'});
    }

}

const putCampanha = async ( req, res ) => {
    const { pool } = req;
    const { id } = req.params;
    const { id_usuario, nome, data_inicio, data_fim, id_estado } = req.body;
    
    let updates = [];
    let values = [];
    let index = 1;
    
    if(id_usuario){
        updates.push(`id_usuario_criador = $${index}`);
        values.push(id_usuario);
        index++;
    }
    if (nome) {
        updates.push(`nome = $${index}`);
        values.push(nome);
        index++;
    }
    if (data_inicio) {
        updates.push(`data_inicio = $${index}`);
        values.push(data_inicio);
        index++;
    }
    if (data_fim) {
        updates.push(`data_fim = $${index}`);
        values.push(data_fim);
        index++;
    }
    if (id_estado) {
        updates.push(`id_estado = $${index}`);
        values.push(id_estado);
        index++;
    }
    // Após inserir verificações para todas as variáveis
    if (updates.length === 0) {
        return res.status(400).json({ message: "Nenhuma atualização informada" });
    }
    values.push(id);
    
    const query = `UPDATE campanhas_balneamento SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;
    
    try{
        const result = await pool.query(query,values);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Campanha de balneamento não encontrada' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Erro ao editar campanha de balneamento'});
    }
}

module.exports = { getAllCampanhas, postCampanha, deleteCampanha, putCampanha, getCampanhasValidas };