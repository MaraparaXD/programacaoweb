const db = require('./banco');

// Consulta base com o nome da categoria de cada produto.
const consulta = `SELECT p.*, c.nome AS categoria
    FROM produtos p JOIN categorias c ON p.categoria_id = c.id`;

// Cria um erro que pode ser devolvido ao cliente da API.
function falhar(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    throw erro;
}

// Confere se o valor representa um número inteiro dentro do limite.
function inteiro(valor, minimo = 0) {
    return Number.isSafeInteger(valor) && valor >= minimo && valor <= 100000000;
}

// Valida os campos obrigatórios e a existência da categoria.
function validar(dados, cadastro) {
    const { nome, categoria_id, preco_centavos, estoque_minimo, estoque } = dados;
    if (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 120) {
        falhar('Informe um nome de 1 a 120 caracteres.');
    }
    if (!inteiro(categoria_id, 1) || !db.prepare('SELECT id FROM categorias WHERE id = ?').get(categoria_id)) {
        falhar('Selecione uma categoria válida.');
    }
    if (!inteiro(preco_centavos, 1)) falhar('Informe um preço positivo em centavos.');
    if (!inteiro(estoque_minimo)) falhar('Informe um estoque mínimo válido.');
    if (cadastro && !inteiro(estoque)) falhar('Informe um estoque inicial válido.');
}

// Lista produtos e permite buscar pelo nome ou pela categoria.
function listar(busca = '') {
    const termo = '%' + busca + '%';
    return db.prepare(consulta + ' WHERE p.nome LIKE ? OR c.nome LIKE ? ORDER BY p.nome').all(termo, termo);
}

// Retorna um produto ou informa que ele não existe.
function obter(id) {
    const produto = db.prepare(consulta + ' WHERE p.id = ?').get(id);
    if (!produto) falhar('Produto não encontrado.', 404);
    return produto;
}

// Cadastra um produto e devolve o registro criado.
function cadastrar(dados) {
    validar(dados, true);
    const resultado = db.prepare(`INSERT INTO produtos
        (nome, categoria_id, preco_centavos, estoque, estoque_minimo)
        VALUES (?, ?, ?, ?, ?)`).run(dados.nome.trim(), dados.categoria_id,
        dados.preco_centavos, dados.estoque, dados.estoque_minimo);
    return obter(Number(resultado.lastInsertRowid));
}

// Altera o cadastro sem modificar diretamente o saldo de estoque.
function editar(id, dados) {
    obter(id);
    validar(dados, false);
    db.prepare(`UPDATE produtos SET nome = ?, categoria_id = ?,
        preco_centavos = ?, estoque_minimo = ? WHERE id = ?`).run(
        dados.nome.trim(), dados.categoria_id, dados.preco_centavos, dados.estoque_minimo, id);
    return obter(id);
}

// Exclui um produto somente quando não possui movimentações registradas.
function excluir(id) {
    obter(id);
    if (db.prepare('SELECT id FROM movimentacoes WHERE produto_id = ?').get(id)) {
        falhar('Produto possui movimentações e não pode ser excluído.', 409);
    }
    db.prepare('DELETE FROM produtos WHERE id = ?').run(id);
    return { mensagem: 'Produto excluído com sucesso.' };
}

module.exports = { listar, obter, cadastrar, editar, excluir, falhar, inteiro };
