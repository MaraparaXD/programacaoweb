# Segunda etapa — integração da interface

O banco, o servidor, as rotas e as funções de leitura já estão prontos. Não é necessário reescrever o back-end. O objetivo é praticar manipulação do DOM e requisições via `fetch`, usando a função `api()` existente em `public/app.js`.

## 1. Cadastro e edição de produtos (obrigatório)

- [ ] Em `salvarProduto(evento)`, leia os campos `nome`, `categoria`, `preco`, `estoque`, `estoque-minimo` e `produto-id`.
- [ ] Use `Number()` para quantidades e categoria e `Math.round(Number(valor) * 100)` para o preço. Valide campos vazios antes da conversão.
- [ ] Sem ID, envie `api('/produtos', 'POST', dados)`; com ID, envie `api('/produtos/' + id, 'PUT', dados)`. Consulte os formatos do README.
- [ ] Em `editarProduto(id)`, use GET pelo ID, preencha o formulário e abra o elemento `details` que o contém. Durante a edição, não permita alterar o estoque inicial; ele é atualizado pelas movimentações. O campo `produto-id` indica o modo de edição.
- [ ] Em caso de sucesso, limpe o formulário (inclusive o ID), restaure o modo cadastro, chame `atualizarTudo()` e mostre `mensagem('Produto salvo com sucesso.')`. Em erro, use `mensagem(erro.message, true)` dentro de um `catch`.
- [ ] Habilite o botão `salvar-produto` no HTML e os botões de edição na criação de linhas em `carregarProdutos()`. Garanta que o botão Limpar também restaure o modo cadastro.

## 2. Exclusão de produtos (obrigatório)

- [ ] Em `excluirProduto(id)`, confirme a intenção com `confirm()` e faça `api('/produtos/' + id, 'DELETE')`.
- [ ] Atualize a tela sem recarregamento manual e apresente mensagem visível de sucesso ou erro. Produtos com histórico retornam 409; não contorne essa regra.
- [ ] Habilite os botões de exclusão em `carregarProdutos()`.

## 3. Busca (bônus)

- [ ] Em `buscarProdutos(evento)`, chame `carregarProdutos($('busca').value)` e trate possíveis erros.
- [ ] Habilite os campos e o botão de busca do HTML. A consulta já usa o parâmetro `nome` e o filtro é executado no SQL pelo servidor.

## 4. Entrada e venda (complemento do ERP)

- [ ] Em `salvarMovimento(evento)`, leia `mov-produto`, `mov-tipo` e `mov-quantidade` e envie `api('/movimentacoes', 'POST', dados)`.
- [ ] Em caso de sucesso, limpe o formulário, atualize indicadores, produtos, seletores e histórico com `atualizarTudo()` e mostre a mensagem. Em caso de erro, exiba a mensagem da API.
- [ ] Habilite o botão `salvar-movimento` no HTML.
- [ ] Retire os textos "em preparação" somente depois de completar as respectivas funções.

## 5. Validação manual e entrega

- [ ] Abrir a página com os 10 produtos iniciais, sem dados de exemplo escritos no HTML.
- [ ] Cadastrar produto, editar, buscar e excluir usando exclusivamente a página.
- [ ] Conferir mensagens de sucesso e erro após cada operação, sem F5.
- [ ] Enviar formulário com campo obrigatório vazio e confirmar que o servidor rejeita requisições inválidas (também coberto por `npm test`).
- [ ] Registrar entrada, venda válida e venda acima do saldo; conferir que estoque e histórico permanecem corretos.
- [ ] Reiniciar o servidor e conferir que os registros persistem.
- [ ] Rodar `npm test` e testar a tela em uma janela menor.
- [ ] Preencher os integrantes e atualizar o estado do README e a declaração de uso de IA.
- [ ] Confirmar tema com o professor e publicar repositório público. Gerar ZIP do mesmo conteúdo, sem `node_modules`, `.git` e arquivos SQLite gerados.

## Bônus previstos na proposta

A segunda tabela relacionada e o relatório SQL já estão implementados. A busca precisa ser conectada na interface. A rota GET por ID já existe; se quiser buscar o bônus de detalhe, crie uma visualização própria de detalhes do produto (não conte apenas com a rota). Paginação/ordenação não foram implementadas como bônus; são opcionais. O professor decide a pontuação.
