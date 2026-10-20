// =========================================================
// app.js — interface: DOM, eventos, listagem, busca e detalhes
// Depende de api.js e favoritos.js (carregados antes no HTML).
// =========================================================

// ----- Elementos da página -----
const formBusca = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");
const tituloCatalogo = document.getElementById("titulo-catalogo");
const btnLimparBusca = document.getElementById("btn-limpar-busca");
const status = document.getElementById("status");
const listaProdutos = document.getElementById("lista-produtos");
const btnMais = document.getElementById("btn-mais");

const listaFavoritos = document.getElementById("lista-favoritos");
const favoritosVazio = document.getElementById("favoritos-vazio");
const contadorFavoritos = document.getElementById("contador-favoritos");
const btnLimparFavoritos = document.getElementById("btn-limpar-favoritos");

const modal = document.getElementById("modal-detalhes");
const conteudoDetalhes = document.getElementById("conteudo-detalhes");
const btnFecharModal = document.getElementById("btn-fechar-modal");

// ----- Estado da aplicação -----
let termoAtual = "";        // "" = listando todos os produtos
let paginaAtual = 0;
let totalProdutos = 0;
let produtosNaTela = [];    // objetos vindos da API, usados para favoritar
let requisicaoAtual = 0;    // evita que uma resposta antiga sobrescreva uma nova
let produtoAberto = null;   // produto exibido no modal

const formatadorPreco = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" });

function formatarPreco(valor) {
    return formatadorPreco.format(valor);
}

// Atalho para criar um elemento com classe e texto
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) {
        elemento.className = classe;
    }
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

// =========================================================
// Mensagens de status (carregando / erro / vazio)
// =========================================================
function mostrarCarregando(mensagem) {
    status.replaceChildren();
    status.className = "status status--carregando";
    status.appendChild(criarElemento("span", "spinner"));
    status.appendChild(criarElemento("span", "", mensagem));
}

function mostrarErro(mensagem, aoTentarNovamente) {
    status.replaceChildren();
    status.className = "status status--erro";
    status.appendChild(criarElemento("p", "", mensagem));

    const botao = criarElemento("button", "botao-secundario", "Tentar novamente");
    botao.type = "button";
    botao.addEventListener("click", aoTentarNovamente);
    status.appendChild(botao);
}

function mostrarAviso(mensagem) {
    status.replaceChildren();
    status.className = "status";
    status.appendChild(criarElemento("p", "", mensagem));
}

function limparStatus() {
    status.replaceChildren();
    status.className = "status";
}

// =========================================================
// Listagem de produtos
// =========================================================
function criarBotaoFavorito(produto) {
    const botao = criarElemento("button", "botao-favorito");
    botao.type = "button";
    botao.dataset.id = produto.id;
    atualizarBotaoFavorito(botao, ehFavorito(produto.id));

    botao.addEventListener("click", function () {
        alternarFavorito(produto);
        atualizarTelaFavoritos();
    });

    return botao;
}

function atualizarBotaoFavorito(botao, favoritado) {
    botao.textContent = favoritado ? "♥" : "♡";
    botao.classList.toggle("ativo", favoritado);
    botao.setAttribute("aria-pressed", favoritado);
    botao.setAttribute("aria-label", favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos");
}

function criarCard(produto) {
    const item = criarElemento("li");
    const card = criarElemento("article", "card");

    const imagem = criarElemento("img", "card__imagem");
    imagem.src = produto.thumbnail;
    imagem.alt = produto.title;
    imagem.loading = "lazy";

    const corpo = criarElemento("div", "card__corpo");
    corpo.appendChild(criarElemento("span", "card__categoria", traduzir("categoria", produto.category)));
    corpo.appendChild(criarElemento("h3", "card__titulo", produto.title));

    const rodape = criarElemento("div", "card__rodape");
    rodape.appendChild(criarElemento("strong", "card__preco", formatarPreco(produto.price)));
    rodape.appendChild(criarElemento("span", "card__nota", `★ ${produto.rating.toFixed(1).replace(".", ",")}`));
    corpo.appendChild(rodape);

    const btnDetalhes = criarElemento("button", "botao-primario", "Ver detalhes");
    btnDetalhes.type = "button";
    btnDetalhes.addEventListener("click", function () {
        abrirDetalhes(produto.id);
    });
    corpo.appendChild(btnDetalhes);

    if (produto.discountPercentage >= 10) {
        card.appendChild(criarElemento("span", "card__selo", `-${Math.round(produto.discountPercentage)}%`));
    }

    card.appendChild(criarBotaoFavorito(produto));
    card.appendChild(imagem);
    card.appendChild(corpo);
    item.appendChild(card);
    return item;
}

function renderizarProdutos(produtos) {
    for (const produto of produtos) {
        listaProdutos.appendChild(criarCard(produto));
    }
}

// Carrega uma página de produtos (lista geral ou resultado da busca).
// "acrescentar" = true quando o usuário clica em "Carregar mais".
async function carregarProdutos(acrescentar) {
    const numeroRequisicao = ++requisicaoAtual;
    const pagina = acrescentar ? paginaAtual + 1 : 0;

    if (!acrescentar) {
        produtosNaTela = [];
        listaProdutos.replaceChildren();
    }

    btnMais.hidden = true;
    mostrarCarregando(termoAtual ? `Pesquisando por "${termoAtual}"...` : "Carregando produtos...");

    try {
        let dados;
        if (termoAtual) {
            dados = await pesquisarProdutos(termoAtual, pagina);
        } else {
            dados = await buscarProdutos(pagina);
        }

        // Uma busca mais nova já foi feita: ignora esta resposta
        if (numeroRequisicao !== requisicaoAtual) {
            return;
        }

        // Só avança a página quando a requisição deu certo
        paginaAtual = pagina;
        totalProdutos = dados.total;
        produtosNaTela = produtosNaTela.concat(dados.products);
        renderizarProdutos(dados.products);

        if (produtosNaTela.length === 0) {
            mostrarAviso(`Nenhum produto encontrado para "${termoAtual}".`);
        } else {
            limparStatus();
        }

        btnMais.hidden = produtosNaTela.length >= totalProdutos;
        atualizarTitulo();
    } catch (erro) {
        if (numeroRequisicao !== requisicaoAtual) {
            return;
        }
        mostrarErro(erro.message, function () {
            carregarProdutos(acrescentar);
        });
        // Se falhou ao "carregar mais", mantém o botão para nova tentativa
        btnMais.hidden = !acrescentar;
    }
}

function atualizarTitulo() {
    if (termoAtual) {
        tituloCatalogo.textContent = `Resultados para "${termoAtual}" (${totalProdutos})`;
        btnLimparBusca.hidden = false;
    } else {
        tituloCatalogo.textContent = `Todos os produtos (${totalProdutos})`;
        btnLimparBusca.hidden = true;
    }
}

// =========================================================
// Detalhes do produto (modal)
// =========================================================
function criarLinhaInfo(rotulo, valor) {
    const linha = criarElemento("div", "info");
    linha.appendChild(criarElemento("dt", "", rotulo));
    linha.appendChild(criarElemento("dd", "", valor));
    return linha;
}

function renderizarDetalhes(produto) {
    conteudoDetalhes.replaceChildren();

    const grade = criarElemento("div", "detalhe");

    // Galeria: imagem principal + miniaturas
    const galeria = criarElemento("div", "detalhe__galeria");
    const imagemPrincipal = criarElemento("img", "detalhe__imagem");
    imagemPrincipal.src = produto.images[0] || produto.thumbnail;
    imagemPrincipal.alt = produto.title;
    galeria.appendChild(imagemPrincipal);

    if (produto.images.length > 1) {
        const miniaturas = criarElemento("div", "detalhe__miniaturas");
        for (const url of produto.images) {
            const botao = criarElemento("button", "miniatura");
            botao.type = "button";
            botao.setAttribute("aria-label", "Ver imagem");
            const img = criarElemento("img");
            img.src = url;
            img.alt = "";
            botao.appendChild(img);
            botao.addEventListener("click", function () {
                imagemPrincipal.src = url;
            });
            miniaturas.appendChild(botao);
        }
        galeria.appendChild(miniaturas);
    }

    // Informações
    const info = criarElemento("div", "detalhe__info");
    info.appendChild(criarElemento("span", "card__categoria", traduzir("categoria", produto.category)));

    const titulo = criarElemento("h2", "detalhe__titulo", produto.title);
    titulo.id = "detalhe-titulo";
    info.appendChild(titulo);

    const precos = criarElemento("p", "detalhe__precos");
    precos.appendChild(criarElemento("strong", "detalhe__preco", formatarPreco(produto.price)));
    if (produto.discountPercentage > 0) {
        const precoOriginal = produto.price / (1 - produto.discountPercentage / 100);
        precos.appendChild(criarElemento("s", "detalhe__preco-antigo", formatarPreco(precoOriginal)));
        precos.appendChild(criarElemento("span", "card__selo card__selo--inline", `-${Math.round(produto.discountPercentage)}%`));
    }
    info.appendChild(precos);

    info.appendChild(criarElemento("p", "detalhe__descricao", produto.description));

    const lista = criarElemento("dl", "detalhe__lista");
    if (produto.brand) {
        lista.appendChild(criarLinhaInfo("Marca", produto.brand));
    }
    lista.appendChild(criarLinhaInfo("Avaliação", `★ ${produto.rating.toFixed(1).replace(".", ",")} de 5`));
    lista.appendChild(criarLinhaInfo("Estoque", `${produto.stock} unidades`));
    lista.appendChild(criarLinhaInfo("Disponibilidade", traduzir("disponibilidade", produto.availabilityStatus)));
    lista.appendChild(criarLinhaInfo("Garantia", traduzir("garantia", produto.warrantyInformation)));
    lista.appendChild(criarLinhaInfo("Entrega", traduzir("entrega", produto.shippingInformation)));
    lista.appendChild(criarLinhaInfo("Devolução", traduzir("devolucao", produto.returnPolicy)));
    info.appendChild(lista);

    const btnFavorito = criarElemento("button", "botao-primario botao-favoritar");
    btnFavorito.type = "button";
    btnFavorito.id = "btn-favorito-modal";
    atualizarBotaoModal(btnFavorito, ehFavorito(produto.id));
    btnFavorito.addEventListener("click", function () {
        alternarFavorito(produto);
        atualizarTelaFavoritos();
    });
    info.appendChild(btnFavorito);

    grade.appendChild(galeria);
    grade.appendChild(info);
    conteudoDetalhes.appendChild(grade);

    // Avaliações dos clientes
    if (produto.reviews && produto.reviews.length > 0) {
        const secao = criarElemento("section", "avaliacoes");
        secao.appendChild(criarElemento("h3", "", "Avaliações de clientes"));
        const listaAvaliacoes = criarElemento("ul");
        for (const avaliacao of produto.reviews) {
            const item = criarElemento("li", "avaliacao");
            const topo = criarElemento("div", "avaliacao__topo");
            topo.appendChild(criarElemento("strong", "", avaliacao.reviewerName));
            topo.appendChild(criarElemento("span", "avaliacao__estrelas", "★".repeat(avaliacao.rating) + "☆".repeat(5 - avaliacao.rating)));
            item.appendChild(topo);
            item.appendChild(criarElemento("p", "", traduzir("comentario", avaliacao.comment)));
            listaAvaliacoes.appendChild(item);
        }
        secao.appendChild(listaAvaliacoes);
        conteudoDetalhes.appendChild(secao);
    }
}

function atualizarBotaoModal(botao, favoritado) {
    botao.textContent = favoritado ? "♥ Remover dos favoritos" : "♡ Adicionar aos favoritos";
    botao.classList.toggle("ativo", favoritado);
}

async function abrirDetalhes(id) {
    produtoAberto = null;
    conteudoDetalhes.replaceChildren();

    const carregando = criarElemento("div", "status status--carregando");
    carregando.appendChild(criarElemento("span", "spinner"));
    carregando.appendChild(criarElemento("span", "", "Carregando detalhes..."));
    conteudoDetalhes.appendChild(carregando);

    if (!modal.open) {
        modal.showModal();
    }

    try {
        const produto = await buscarProdutoPorId(id);
        produtoAberto = produto;
        renderizarDetalhes(produto);
    } catch (erro) {
        conteudoDetalhes.replaceChildren();
        const caixa = criarElemento("div", "status status--erro");
        caixa.appendChild(criarElemento("p", "", erro.message));
        const botao = criarElemento("button", "botao-secundario", "Tentar novamente");
        botao.type = "button";
        botao.addEventListener("click", function () {
            abrirDetalhes(id);
        });
        caixa.appendChild(botao);
        conteudoDetalhes.appendChild(caixa);
    }
}

function fecharDetalhes() {
    modal.close();
}

// =========================================================
// Favoritos na tela
// =========================================================
function renderizarFavoritos() {
    const favoritos = carregarFavoritos();
    listaFavoritos.replaceChildren();

    contadorFavoritos.textContent = favoritos.length;
    favoritosVazio.hidden = favoritos.length > 0;
    btnLimparFavoritos.hidden = favoritos.length === 0;

    for (const favorito of favoritos) {
        const item = criarElemento("li", "favorito");

        const img = criarElemento("img", "favorito__imagem");
        img.src = favorito.imagem;
        img.alt = "";

        const info = criarElemento("button", "favorito__info");
        info.type = "button";
        info.setAttribute("aria-label", `Ver detalhes de ${favorito.titulo}`);
        info.appendChild(criarElemento("span", "favorito__titulo", favorito.titulo));
        info.appendChild(criarElemento("span", "favorito__preco", formatarPreco(favorito.preco)));
        info.addEventListener("click", function () {
            abrirDetalhes(favorito.id);
        });

        const remover = criarElemento("button", "favorito__remover", "×");
        remover.type = "button";
        remover.setAttribute("aria-label", `Remover ${favorito.titulo} dos favoritos`);
        remover.addEventListener("click", function () {
            removerFavorito(favorito.id);
            atualizarTelaFavoritos();
        });

        item.appendChild(img);
        item.appendChild(info);
        item.appendChild(remover);
        listaFavoritos.appendChild(item);
    }
}

// Sincroniza tudo que depende dos favoritos: lateral, corações dos cards e modal
function atualizarTelaFavoritos() {
    renderizarFavoritos();

    const botoes = listaProdutos.querySelectorAll(".botao-favorito");
    for (const botao of botoes) {
        atualizarBotaoFavorito(botao, ehFavorito(Number(botao.dataset.id)));
    }

    const btnModal = document.getElementById("btn-favorito-modal");
    if (btnModal && produtoAberto) {
        atualizarBotaoModal(btnModal, ehFavorito(produtoAberto.id));
    }
}

// =========================================================
// Eventos
// =========================================================
formBusca.addEventListener("submit", function (evento) {
    evento.preventDefault();
    termoAtual = campoBusca.value.trim();
    carregarProdutos(false);
});

btnLimparBusca.addEventListener("click", function () {
    campoBusca.value = "";
    termoAtual = "";
    carregarProdutos(false);
});

btnMais.addEventListener("click", function () {
    carregarProdutos(true);
});

btnLimparFavoritos.addEventListener("click", function () {
    if (confirm("Remover todos os produtos dos favoritos?")) {
        limparFavoritos();
        atualizarTelaFavoritos();
    }
});

btnFecharModal.addEventListener("click", fecharDetalhes);

// Fecha o modal ao clicar fora do conteúdo (no fundo escuro)
modal.addEventListener("click", function (evento) {
    if (evento.target === modal) {
        fecharDetalhes();
    }
});

// Mantém favoritos sincronizados se a página estiver aberta em outra aba
window.addEventListener("storage", function (evento) {
    if (evento.key === CHAVE_FAVORITOS || evento.key === null) {
        atualizarTelaFavoritos();
    }
});

// =========================================================
// Inicialização: recupera favoritos e carrega a 1ª página
// =========================================================
renderizarFavoritos();
carregarProdutos(false);
