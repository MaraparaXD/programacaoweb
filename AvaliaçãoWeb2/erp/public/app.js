// Atalhos para elementos e formatação de valores monetários.
const $ = id => document.getElementById(id);
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Envia requisições à API e transforma erros HTTP em mensagens legíveis.
async function api(rota, metodo = 'GET', dados) {
    const opcoes = { method: metodo };
    if (dados !== undefined) {
        opcoes.headers = { 'Content-Type': 'application/json' };
        opcoes.body = JSON.stringify(dados);
    }
    const resposta = await fetch('/api' + rota, opcoes);
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.erro || 'Erro na operação.');
    return resultado;
}

// Exibe feedback de sucesso ou de erro na página.
function mensagem(texto, erro = false) {
    const aviso = $('mensagem');
    aviso.textContent = texto;
    aviso.className = erro ? 'erro' : '';
    aviso.hidden = !texto;
}

// Cria uma célula utilizando texto, sem interpretar HTML vindo do banco.
function celula(linha, texto) {
    const td = linha.insertCell();
    td.textContent = texto;
    return td;
}

// Exibe uma mensagem quando não há registros para listar.
function tabelaVazia(tabela, colunas, texto) {
    const td = celula(tabela.insertRow(), texto);
    td.colSpan = colunas;
    td.className = 'empty';
}

// Carrega o catálogo a partir do banco e monta as linhas da tabela.
async function carregarProdutos(busca = '') {
    const produtos = await api('/produtos?nome=' + encodeURIComponent(busca));
    const tabela = $('lista-produtos');
    tabela.replaceChildren();
    if (!produtos.length) tabelaVazia(tabela, 6, 'Nenhum produto encontrado.');
    for (const produto of produtos) {
        const linha = tabela.insertRow();
        celula(linha, produto.nome);
        celula(linha, produto.categoria);
        celula(linha, moeda.format(produto.preco_centavos / 100));
        celula(linha, produto.estoque);
        const baixo = produto.estoque <= produto.estoque_minimo;
        const status = document.createElement('span');
        status.className = baixo ? 'stock low' : 'stock';
        status.textContent = baixo ? 'Estoque baixo' : 'Disponível';
        linha.insertCell().append(status);
        const acoes = linha.insertCell();
        acoes.className = 'actions';
        for (const nome of ['Editar', 'Excluir']) {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.textContent = nome;
            botao.dataset.id = produto.id;
            botao.dataset.acao = nome.toLowerCase();
            botao.className = nome === 'Excluir' ? 'danger' : 'secondary';
            botao.disabled = true;
            acoes.append(botao);
        }
    }
}

// Preenche um seletor com registros recebidos da API.
function preencherSelect(id, registros) {
    const select = $(id);
    select.replaceChildren(new Option('Selecione', ''));
    for (const registro of registros) select.add(new Option(registro.nome, registro.id));
}

// Atualiza os seletores de categorias e produtos sem dados fixos no HTML.
async function carregarSeletores() {
    preencherSelect('categoria', await api('/categorias'));
    preencherSelect('mov-produto', await api('/produtos'));
}

// Atualiza os indicadores calculados pelo banco de dados.
async function carregarResumo() {
    const resumo = await api('/relatorio');
    $('total-produtos').textContent = resumo.produtos;
    $('total-unidades').textContent = resumo.unidades;
    $('total-baixo').textContent = resumo.estoque_baixo;
    $('total-vendas').textContent = moeda.format(resumo.vendas_centavos / 100);
}

// Renderiza o histórico de movimentações retornado pelo servidor.
async function carregarMovimentos() {
    const movimentos = await api('/movimentacoes');
    const tabela = $('lista-movimentos');
    tabela.replaceChildren();
    if (!movimentos.length) tabelaVazia(tabela, 5, 'Nenhuma movimentação registrada.');
    for (const movimento of movimentos) {
        const linha = tabela.insertRow();
        celula(linha, movimento.produto);
        celula(linha, movimento.tipo === 'venda' ? 'Venda' : 'Entrada');
        celula(linha, movimento.quantidade);
        celula(linha, moeda.format(movimento.preco_centavos / 100));
        celula(linha, movimento.data);
    }
}

// Recarrega os dados após operações, sem atualizar a página manualmente.
async function atualizarTudo() {
    await Promise.all([carregarProdutos($('busca').value), carregarResumo(), carregarSeletores(), carregarMovimentos()]);
}

// Tarefa pendente: conectar o formulário de produto à API POST ou PUT.
async function salvarProduto(evento) {
    evento.preventDefault();
    mensagem('Cadastro e edição ainda precisam ser integrados.', true);
}

// Tarefa pendente: buscar o produto pelo ID e preencher o formulário.
async function editarProduto(id) {
    mensagem('Edição ainda precisa ser integrada.', true);
}

// Tarefa pendente: confirmar a operação e chamar DELETE na API.
async function excluirProduto(id) {
    mensagem('Exclusão ainda precisa ser integrada.', true);
}

// Tarefa pendente: enviar os dados do formulário ao endpoint de movimentações.
async function salvarMovimento(evento) {
    evento.preventDefault();
    mensagem('Registro de movimentação ainda precisa ser integrado.', true);
}

// Tarefa pendente: enviar o filtro digitado à função carregarProdutos.
async function buscarProdutos(evento) {
    evento.preventDefault();
    mensagem('Busca ainda precisa ser integrada.', true);
}

// Inicializa os eventos e carrega os dados do servidor ao abrir a página.
async function iniciar() {
    $('form-produto').addEventListener('submit', salvarProduto);
    $('form-movimento').addEventListener('submit', salvarMovimento);
    $('form-busca').addEventListener('submit', buscarProdutos);
    $('lista-produtos').addEventListener('click', evento => {
        const botao = evento.target.closest('button[data-acao]');
        if (!botao) return;
        const id = Number(botao.dataset.id);
        if (botao.dataset.acao === 'editar') editarProduto(id);
        if (botao.dataset.acao === 'excluir') excluirProduto(id);
    });
    try {
        await atualizarTudo();
        $('conexao').textContent = 'API conectada';
    } catch (erro) {
        $('conexao').textContent = 'API indisponível';
        $('conexao').className = 'status offline';
        mensagem(erro.message, true);
    }
}

iniciar();
