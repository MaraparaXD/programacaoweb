// =========================================================
// api.js — comunicação com a API pública DummyJSON
// Todas as requisições usam o método GET com fetch + async/await.
// =========================================================

const API_URL = "https://dummyjson.com/products";
const ITENS_POR_PAGINA = 20;

// Campos que a listagem precisa (deixa a resposta menor)
const CAMPOS_LISTAGEM = "title,price,thumbnail,category,rating,discountPercentage";

// Faz uma requisição GET e devolve o JSON já convertido em objeto.
// Lança um erro com mensagem amigável se a rede ou a API falharem.
async function requisitar(url) {
    let resposta;

    try {
        resposta = await fetch(url, { method: "GET" });
    } catch (erro) {
        // fetch só rejeita quando não há resposta (sem internet, DNS, CORS...)
        throw new Error("Não foi possível conectar à API. Verifique sua conexão com a internet.");
    }

    if (!resposta.ok) {
        if (resposta.status === 404) {
            throw new Error("O produto solicitado não foi encontrado (erro 404).");
        }
        if (resposta.status >= 500) {
            throw new Error(`A API está indisponível no momento (erro ${resposta.status}). Tente novamente mais tarde.`);
        }
        throw new Error(`A API respondeu com um erro (status ${resposta.status}).`);
    }

    try {
        return await resposta.json();
    } catch (erro) {
        throw new Error("A resposta da API veio em um formato inesperado.");
    }
}

// Lista os produtos (paginado)
async function buscarProdutos(pagina) {
    const skip = pagina * ITENS_POR_PAGINA;
    const url = `${API_URL}?limit=${ITENS_POR_PAGINA}&skip=${skip}&select=${CAMPOS_LISTAGEM}`;
    return requisitar(url);
}

// Pesquisa produtos pelo nome (parâmetro ?q=)
async function pesquisarProdutos(termo, pagina) {
    const skip = pagina * ITENS_POR_PAGINA;
    const q = encodeURIComponent(termo);
    const url = `${API_URL}/search?q=${q}&limit=${ITENS_POR_PAGINA}&skip=${skip}&select=${CAMPOS_LISTAGEM}`;
    return requisitar(url);
}

// Busca todas as informações de um único produto
async function buscarProdutoPorId(id) {
    return requisitar(`${API_URL}/${id}`);
}
