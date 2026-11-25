const db = require('./banco');
const { obter, falhar, inteiro } = require('./produtos');

// Registra uma entrada ou venda e atualiza o saldo na mesma transação.
function movimentar(dados) {
    const { produto_id, tipo, quantidade } = dados;
    if (!inteiro(produto_id, 1)) falhar('Informe um produto válido.');
    if (!['entrada', 'venda'].includes(tipo)) falhar('Selecione entrada ou venda.');
    if (!inteiro(quantidade, 1)) falhar('Informe uma quantidade positiva.');
    db.exec('BEGIN IMMEDIATE');
    try {
        const produto = obter(produto_id);
        const saldo = produto.estoque + (tipo === 'entrada' ? quantidade : -quantidade);
        if (saldo < 0) falhar('Estoque insuficiente para a venda.', 409);
        if (!inteiro(saldo)) falhar('Limite de estoque excedido.');
        db.prepare('UPDATE produtos SET estoque = ? WHERE id = ?').run(saldo, produto_id);
        const resultado = db.prepare(`INSERT INTO movimentacoes
            (produto_id, tipo, quantidade, preco_centavos) VALUES (?, ?, ?, ?)`)
            .run(produto_id, tipo, quantidade, produto.preco_centavos);
        const movimento = db.prepare('SELECT * FROM movimentacoes WHERE id = ?')
            .get(Number(resultado.lastInsertRowid));
        db.exec('COMMIT');
        return movimento;
    } catch (erro) {
        db.exec('ROLLBACK');
        throw erro;
    }
}

// Lista o histórico de entradas e vendas com o nome do produto.
function listarMovimentacoes() {
    return db.prepare(`SELECT m.*, p.nome AS produto FROM movimentacoes m
        JOIN produtos p ON p.id = m.produto_id ORDER BY m.id DESC`).all();
}

// Calcula os indicadores do painel por agregação no banco.
function resumo() {
    const estoque = db.prepare(`SELECT COUNT(*) AS produtos,
        COALESCE(SUM(estoque), 0) AS unidades,
        COALESCE(SUM(CASE WHEN estoque <= estoque_minimo THEN 1 ELSE 0 END), 0) AS estoque_baixo
        FROM produtos`).get();
    const vendas = db.prepare(`SELECT COALESCE(SUM(quantidade * preco_centavos), 0) AS vendas_centavos
        FROM movimentacoes WHERE tipo = 'venda'`).get();
    return { ...estoque, ...vendas };
}

module.exports = { movimentar, listarMovimentacoes, resumo };
