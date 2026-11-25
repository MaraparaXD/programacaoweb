const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { once } = require('node:events');

// Inicia o servidor em uma porta livre, usando um banco de teste isolado.
async function iniciarServidor(caminho) {
    const processo = spawn(process.execPath, ['servidor.js'], {
        cwd: join(__dirname, '..'),
        env: { ...process.env, ERP_BANCO: caminho, PORT: '0' }
    });
    const endereco = await new Promise((resolve, reject) => {
        processo.once('error', reject);
        processo.once('exit', codigo => reject(new Error('Servidor saiu: ' + codigo)));
        processo.stdout.on('data', trecho => {
            const url = trecho.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
            if (url) resolve(url[0]);
        });
    });
    return { processo, endereco };
}

// Encerra o processo para verificar a persistência em uma nova execução.
async function parar(servidor) {
    if (servidor && servidor.processo.exitCode === null && servidor.processo.signalCode === null) {
        const fim = once(servidor.processo, 'exit');
        servidor.processo.kill();
        await fim;
    }
}

// Executa uma requisição e verifica o status e o retorno JSON.
async function chamar(base, rota, status, metodo = 'GET', dados) {
    const opcoes = { method: metodo };
    if (dados !== undefined) {
        opcoes.headers = { 'Content-Type': 'application/json' };
        opcoes.body = JSON.stringify(dados);
    }
    const resposta = await fetch(base + '/api' + rota, opcoes);
    assert.equal(resposta.status, status);
    assert.match(resposta.headers.get('content-type'), /application\/json/);
    return resposta.json();
}

test('API completa: CRUD, filtros, estoque, erros e persistência', { timeout: 20000 }, async t => {
    const pasta = mkdtempSync(join(tmpdir(), 'mini-erp-'));
    const caminho = join(pasta, 'teste.sqlite');
    let servidor;
    try {
        servidor = await iniciarServidor(caminho);
        let base = servidor.endereco;
        let id;
        const dados = { nome: 'Produto de teste', categoria_id: 1, preco_centavos: 1234, estoque: 10, estoque_minimo: 2 };
        await t.test('Página, dados iniciais e categorias', async () => {
            for (const rota of ['/', '/style.css', '/app.js']) {
                assert.equal((await fetch(base + rota)).status, 200);
            }
            assert.equal((await chamar(base, '/produtos', 200)).length, 10);
            assert.equal((await chamar(base, '/categorias', 200)).length, 3);
        });
        await t.test('Cadastro, leitura, filtro e edição', async () => {
            const criado = await chamar(base, '/produtos', 201, 'POST', dados);
            id = criado.id;
            assert.equal((await chamar(base, '/produtos/' + id, 200)).estoque, 10);
            assert.equal((await chamar(base, '/produtos?nome=Produto%20de%20teste', 200)).length, 1);
            const alterado = await chamar(base, '/produtos/' + id, 200, 'PUT', { ...dados, nome: 'Produto alterado', estoque: 999 });
            assert.equal(alterado.nome, 'Produto alterado');
            assert.equal(alterado.estoque, 10);
        });
        await t.test('Campos vazios, categoria inválida e JSON malformado', async () => {
            await chamar(base, '/produtos', 400, 'POST', { ...dados, nome: ' ' });
            await chamar(base, '/produtos', 400, 'POST', { ...dados, categoria_id: 99 });
            await chamar(base, '/produtos', 400, 'POST', null);
            const resposta = await fetch(base + '/api/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
            assert.equal(resposta.status, 400);
            await chamar(base, '/produtos/9999', 404);
            assert.equal((await chamar(base, '/produtos', 200)).length, 11);
        });
        await t.test('Venda, entrada, relatório e proteção do estoque', async () => {
            await chamar(base, '/movimentacoes', 201, 'POST', { produto_id: id, tipo: 'venda', quantidade: 3 });
            await chamar(base, '/movimentacoes', 409, 'POST', { produto_id: id, tipo: 'venda', quantidade: 8 });
            assert.equal((await chamar(base, '/produtos/' + id, 200)).estoque, 7);
            await chamar(base, '/movimentacoes', 201, 'POST', { produto_id: id, tipo: 'entrada', quantidade: 2 });
            assert.equal((await chamar(base, '/produtos/' + id, 200)).estoque, 9);
            assert.equal((await chamar(base, '/movimentacoes', 200)).length, 2);
            assert.equal((await chamar(base, '/relatorio', 200)).vendas_centavos, 3702);
            await chamar(base, '/produtos/' + id, 409, 'DELETE');
        });
        await t.test('Exclusão de produto sem movimentações', async () => {
            const temporario = await chamar(base, '/produtos', 201, 'POST', dados);
            await chamar(base, '/produtos/' + temporario.id, 200, 'DELETE');
            await chamar(base, '/produtos/' + temporario.id, 404);
        });
        await t.test('Reinício mantém dados e não duplica registros iniciais', async () => {
            await parar(servidor);
            servidor = await iniciarServidor(caminho);
            base = servidor.endereco;
            const produto = await chamar(base, '/produtos/' + id, 200);
            assert.equal(produto.nome, 'Produto alterado');
            assert.equal(produto.estoque, 9);
            assert.equal((await chamar(base, '/produtos', 200)).length, 11);
            assert.equal((await chamar(base, '/movimentacoes', 200)).length, 2);
        });
    } finally {
        await parar(servidor);
        rmSync(pasta, { recursive: true, force: true });
    }
});
