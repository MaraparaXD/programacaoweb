const http = require('node:http');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const db = require('./banco');
const produtos = require('./produtos');
const estoque = require('./estoque');

// Porta local compartilhada pela página e pela API.
const porta = Number(process.env.PORT || 3000);

// Arquivos públicos permitidos, evitando acesso a arquivos privados.
const arquivos = {
    '/': ['index.html', 'text/html'],
    '/style.css': ['style.css', 'text/css'],
    '/app.js': ['app.js', 'application/javascript']
};

// Envia uma resposta JSON com o código HTTP informado.
function json(res, status, dados) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(dados));
}

// Recebe e valida um corpo JSON de até 64 KB.
async function lerJSON(req) {
    if (!(req.headers['content-type'] || '').includes('application/json')) {
        produtos.falhar('Envie os dados no formato JSON.', 415);
    }
    const partes = [];
    let tamanho = 0;
    let excedeu = false;
    for await (const trecho of req) {
        tamanho += trecho.length;
        if (tamanho > 65536) excedeu = true;
        if (!excedeu) partes.push(trecho);
    }
    if (excedeu) produtos.falhar('Requisição muito grande.', 413);
    let dados;
    try { dados = JSON.parse(Buffer.concat(partes).toString('utf8')); }
    catch { produtos.falhar('JSON inválido.'); }
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        produtos.falhar('Informe um objeto JSON.');
    }
    return dados;
}

// Direciona as requisições da API para as funções de negócio.
async function atenderAPI(req, res, url) {
    const { pathname, searchParams } = url;
    const metodo = req.method;
    if (pathname === '/api/produtos') {
        if (metodo === 'GET') return json(res, 200, produtos.listar(searchParams.get('nome') || ''));
        if (metodo === 'POST') return json(res, 201, produtos.cadastrar(await lerJSON(req)));
        return json(res, 405, { erro: 'Método não permitido.' });
    }
    const rotaProduto = pathname.match(/^\/api\/produtos\/(\d+)$/);
    if (rotaProduto) {
        const id = Number(rotaProduto[1]);
        if (!produtos.inteiro(id, 1)) produtos.falhar('ID inválido.');
        if (metodo === 'GET') return json(res, 200, produtos.obter(id));
        if (metodo === 'PUT') return json(res, 200, produtos.editar(id, await lerJSON(req)));
        if (metodo === 'DELETE') return json(res, 200, produtos.excluir(id));
        return json(res, 405, { erro: 'Método não permitido.' });
    }
    if (pathname === '/api/categorias' && metodo === 'GET') {
        return json(res, 200, db.prepare('SELECT * FROM categorias ORDER BY nome').all());
    }
    if (pathname === '/api/movimentacoes') {
        if (metodo === 'GET') return json(res, 200, estoque.listarMovimentacoes());
        if (metodo === 'POST') return json(res, 201, estoque.movimentar(await lerJSON(req)));
        return json(res, 405, { erro: 'Método não permitido.' });
    }
    if (pathname === '/api/relatorio' && metodo === 'GET') return json(res, 200, estoque.resumo());
    return json(res, 404, { erro: 'Rota não encontrada.' });
}

// Serve a página web e protege o servidor contra requisições inválidas.
const servidor = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/api/')) return await atenderAPI(req, res, url);
        const arquivo = Object.hasOwn(arquivos, url.pathname) ? arquivos[url.pathname] : null;
        if (!arquivo || req.method !== 'GET') return json(res, 404, { erro: 'Página não encontrada.' });
        const conteudo = readFileSync(join(__dirname, 'public', arquivo[0]));
        res.writeHead(200, { 'Content-Type': arquivo[1] + '; charset=utf-8' });
        res.end(conteudo);
    } catch (erro) {
        if (!erro.status) console.error(erro);
        if (!res.headersSent) json(res, erro.status || 500, { erro: erro.status ? erro.message : 'Erro interno do servidor.' });
    }
});
servidor.listen(porta, '127.0.0.1', () => {
    console.log(`ERP disponível em http://127.0.0.1:${servidor.address().port}`);
});
