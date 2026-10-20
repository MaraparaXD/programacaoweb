// =========================================================
// traducao.js — traduz para português os campos da API que
// têm um conjunto fixo de valores. Nome e descrição dos
// produtos são texto livre e continuam como vêm da API.
// =========================================================

const TRADUCOES = {
    categoria: {
        "beauty": "Beleza",
        "fragrances": "Perfumes",
        "furniture": "Móveis",
        "groceries": "Mercearia",
        "home-decoration": "Decoração",
        "kitchen-accessories": "Cozinha",
        "laptops": "Notebooks",
        "mens-shirts": "Camisas masculinas",
        "mens-shoes": "Calçados masculinos",
        "mens-watches": "Relógios masculinos",
        "mobile-accessories": "Acessórios para celular",
        "motorcycle": "Motos",
        "skin-care": "Cuidados com a pele",
        "smartphones": "Celulares",
        "sports-accessories": "Esportes",
        "sunglasses": "Óculos de sol",
        "tablets": "Tablets",
        "tops": "Blusas",
        "vehicle": "Veículos",
        "womens-bags": "Bolsas femininas",
        "womens-dresses": "Vestidos",
        "womens-jewellery": "Joias femininas",
        "womens-shoes": "Calçados femininos",
        "womens-watches": "Relógios femininos"
    },
    disponibilidade: {
        "In Stock": "Em estoque",
        "Low Stock": "Últimas unidades",
        "Out of Stock": "Esgotado"
    },
    garantia: {
        "No warranty": "Sem garantia",
        "1 week warranty": "1 semana de garantia",
        "1 month warranty": "1 mês de garantia",
        "3 months warranty": "3 meses de garantia",
        "6 months warranty": "6 meses de garantia",
        "1 year warranty": "1 ano de garantia",
        "2 year warranty": "2 anos de garantia",
        "3 year warranty": "3 anos de garantia",
        "5 year warranty": "5 anos de garantia",
        "Lifetime warranty": "Garantia vitalícia"
    },
    entrega: {
        "Ships overnight": "Envio no dia seguinte",
        "Ships in 1-2 business days": "Envio em 1 a 2 dias úteis",
        "Ships in 3-5 business days": "Envio em 3 a 5 dias úteis",
        "Ships in 1 week": "Envio em 1 semana",
        "Ships in 2 weeks": "Envio em 2 semanas",
        "Ships in 1 month": "Envio em 1 mês"
    },
    devolucao: {
        "No return policy": "Não aceita devolução",
        "7 days return policy": "Devolução em até 7 dias",
        "30 days return policy": "Devolução em até 30 dias",
        "60 days return policy": "Devolução em até 60 dias",
        "90 days return policy": "Devolução em até 90 dias"
    },
    comentario: {
        "Great product!": "Ótimo produto!",
        "Awesome product!": "Produto incrível!",
        "Excellent quality!": "Qualidade excelente!",
        "Highly impressed!": "Muito impressionado!",
        "Highly recommended!": "Recomendo muito!",
        "Very satisfied!": "Muito satisfeito!",
        "Very pleased!": "Muito contente!",
        "Very happy with my purchase!": "Muito feliz com a compra!",
        "Would buy again!": "Compraria de novo!",
        "Great value for money!": "Ótimo custo-benefício!",
        "Fast shipping!": "Entrega rápida!",
        "Would not recommend!": "Não recomendo!",
        "Would not buy again!": "Não compraria de novo!",
        "Poor quality!": "Qualidade ruim!",
        "Not as described!": "Diferente do anunciado!",
        "Not worth the price!": "Não vale o preço!",
        "Waste of money!": "Dinheiro jogado fora!",
        "Disappointing product!": "Produto decepcionante!",
        "Very disappointed!": "Muito decepcionado!",
        "Very dissatisfied!": "Muito insatisfeito!",
        "Very unhappy with my purchase!": "Muito insatisfeito com a compra!"
    }
};

// Devolve a tradução do valor; se não existir, devolve o próprio valor
function traduzir(tipo, valor) {
    const dicionario = TRADUCOES[tipo];
    if (dicionario && dicionario[valor]) {
        return dicionario[valor];
    }
    return valor;
}
