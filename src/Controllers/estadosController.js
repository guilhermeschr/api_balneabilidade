const getAllEstados = async ( req, res ) => {
    const { pool } = req;

    try{
        const result  = await pool.query('SELECT * FROM estados');
        res.status(200).json(result.rows); // Envia a lista de estados
    }
    catch (error){
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar estados' });
    }
}

const postEstado = async  ( req, res ) => {
    const { pool } = req; // Pega o pool de conexões do banco de dados
    const { nome } = req.body; // Pega os dados do usuário no corpo da requisição

    try {
        const result = await pool.query(
            'INSERT INTO estados (nome) VALUES ($1) RETURNING *',
            [ nome ]
        );
        res.status(201).json(result.rows[0]); // Retorna o estado criado
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao inserir estado' });
    }
}

const deleteEstado = async ( req, res ) => {
    const { pool } = req;
    const { id } = req.params;

    try{
        const result = await pool.query(
            'delete from estados where id = $1 RETURNING *',
            [id]
        )

        // Se a exclusão for bem-sucedida, o `result.rowCount` será maior que 0
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Estado não encontrado' });
        }

        res.status(204).json({message: 'Estado excluído com sucesso!'})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar estado' });
    }
}

const putEstado = async ( req, res ) => {
    const { pool } = req;
    const { id } = req.params;
    const { nome } = req.body;

    let updates = [];
    let values = [];
    let index = 1;

    if(nome){
        updates.push(`nome = $${index}`);
        values.push(nome);
        index++;
    }

    if(updates.length === 0){
        return res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização' });
    }

    values.push(id);

    const query = `UPDATE estados SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`

    try{
        const result = await pool.query(query,values);

        // Se a atualização for bem-sucedida, o `result.rowCount` será maior que 0
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Estado não encontrado' });
        }

        //retorna os dados alterados
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao editar estado' })
    }

}

module.exports = { getAllEstados, postEstado, deleteEstado, putEstado };