// =========================================================
// favoritos.js — lista de favoritos salva no localStorage
// O localStorage só guarda texto, por isso usamos JSON.stringify
// para salvar e JSON.parse para recuperar o array de objetos.
// =========================================================

const CHAVE_FAVORITOS = "vitrine:favoritos";

// Recupera o array de favoritos (ou [] na primeira vez / se estiver corrompido)
function carregarFavoritos() {
    const texto = localStorage.getItem(CHAVE_FAVORITOS);

    if (texto === null) {
        return [];
    }

    try {
        const dados = JSON.parse(texto);
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        return [];
    }
}

function salvarFavoritos(favoritos) {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos));
}

// Cria o objeto que representa um favorito a partir do produto da API
function criarFavorito(produto) {
    return {
        id: produto.id,
        titulo: produto.title,
        preco: Number(produto.price),
        imagem: produto.thumbnail,
        categoria: produto.category,
        adicionadoEm: new Date().toISOString()
    };
}

function ehFavorito(id) {
    const favoritos = carregarFavoritos();
    for (const favorito of favoritos) {
        if (favorito.id === id) {
            return true;
        }
    }
    return false;
}

function adicionarFavorito(produto) {
    const favoritos = carregarFavoritos();
    if (!ehFavorito(produto.id)) {
        favoritos.push(criarFavorito(produto));
        salvarFavoritos(favoritos);
    }
}

function removerFavorito(id) {
    const favoritos = carregarFavoritos().filter(function (favorito) {
        return favorito.id !== id;
    });
    salvarFavoritos(favoritos);
}

// Adiciona se não for favorito, remove se já for. Devolve o novo estado.
function alternarFavorito(produto) {
    if (ehFavorito(produto.id)) {
        removerFavorito(produto.id);
        return false;
    }
    adicionarFavorito(produto);
    return true;
}

function limparFavoritos() {
    localStorage.removeItem(CHAVE_FAVORITOS);
}
