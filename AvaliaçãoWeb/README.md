# Vitrine — Catálogo Interativo de Produtos

Trabalho em Grupo 1 da disciplina de **Programação Web** (Bacharelado em Sistemas de Informação — UFOPA).

Aplicação Web que consome a API pública [DummyJSON](https://dummyjson.com/docs/products) para listar e pesquisar produtos, mostrar os detalhes de cada um e manter uma lista de favoritos salva no navegador. Foi feita só com **HTML, CSS e JavaScript puro**, sem frameworks, bibliotecas, servidor próprio ou banco de dados.

## Integrantes

| Nome | Matrícula |
|---|---|
| Tiago Marapara Leão | 2024013680 |

## Funcionalidades

| Funcionalidade | Como funciona |
|---|---|
| **Listagem** | Produtos em cartões com nome, imagem, preço, categoria, nota e selo de desconto. Paginação com o botão "Carregar mais" (20 por vez). |
| **Pesquisa** | Formulário de busca por nome (`/products/search?q=`). O botão "Limpar busca" volta para a lista completa. |
| **Detalhes** | "Ver detalhes" abre uma janela (`<dialog>`) com galeria de imagens, descrição, marca, estoque, garantia, entrega, devolução e avaliações de clientes. |
| **Favoritos** | O botão ♡ nos cartões ou na janela de detalhes adiciona ou remove o produto. A lista lateral permite abrir os detalhes, remover um item ou limpar tudo. |
| **Persistência** | Os favoritos ficam no `localStorage` (`JSON.stringify` / `JSON.parse`) e continuam lá ao recarregar a página. Se o site estiver aberto em duas abas, as duas ficam sincronizadas. |
| **Carregamento** | Mensagem com animação enquanto os produtos ou os detalhes são buscados. |
| **Tratamento de erros** | Mensagens diferentes para falha de rede, erro 404, erro 5xx e resposta inválida, com o botão "Tentar novamente". Uma busca vazia mostra "Nenhum produto encontrado". |
| **Responsividade** | O layout se adapta a celular, tablet e desktop. |
| **Tradução** | Categorias, disponibilidade, garantia, entrega, devolução e comentários das avaliações aparecem em português. |

> **Sobre o idioma:** a DummyJSON só tem dados em inglês. Os campos com valores fixos são traduzidos pelo arquivo `js/traducao.js`. Já o **nome** e a **descrição** dos produtos são texto livre e aparecem como vêm da API. Pelo mesmo motivo, a pesquisa funciona com termos em inglês (ex.: `phone`, `watch`, `shirt`).

## Como executar

Não precisa instalar nada, mas é preciso estar conectado à internet, porque os dados vêm da API.

1. Clone ou baixe este repositório.
2. Abra o arquivo `index.html` no navegador (com dois cliques).

Também é possível usar a extensão **Live Server** do VS Code: clique com o botão direito em `index.html` e escolha *Open with Live Server*.

## Estrutura de arquivos

```
AvaliaçãoWeb/
├── index.html        # Estrutura da página (HTML semântico)
├── css/
│   └── style.css     # Estilos e responsividade
├── js/
│   ├── traducao.js   # Tradução para português dos campos com valores fixos da API
│   ├── api.js        # Requisições GET à API com fetch + async/await e tratamento de erros
│   ├── favoritos.js  # Objetos de favorito e persistência no localStorage
│   └── app.js        # Manipulação do DOM, eventos, listagem, busca e detalhes
└── README.md
```

## Conteúdos aplicados

- **DOM e eventos:** elementos criados com `createElement`, eventos de `submit` e `click`, e textos inseridos com `textContent`.
- **Objetos e JSON:** os objetos da API são percorridos com `for...of`, e cada favorito é um objeto próprio (`{ id, titulo, preco, imagem, categoria, adicionadoEm }`).
- **HTTP e Fetch API:** requisições `GET` com `async/await`, conferência de `response.ok` e do status HTTP, e `try/catch` para erros de rede.
- **localStorage:** os favoritos são salvos com `setItem` e lidos com `getItem`. Na primeira visita, quando ainda não há nada salvo, o código começa com uma lista vazia (`[]`).

## API utilizada

- Listagem: `GET https://dummyjson.com/products?limit=20&skip=0`
- Pesquisa: `GET https://dummyjson.com/products/search?q=termo`
- Detalhes: `GET https://dummyjson.com/products/{id}`
