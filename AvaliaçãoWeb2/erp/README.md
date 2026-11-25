# Mini ERP — Gestão de estoque e vendas

Segunda Avaliação em grupo de Programação Web — Sistemas de Informação.


## Integrantes

- TIAGO MARAPARA LEÃO — matrícula 2024013680
- SANDER ALEX DE AMORIM FEITOSA - matrícula 2024004804 

## Tema

 ERP de controle de estoque e vendas para pequenos comércios. Permite consultar produtos, registrar entradas e vendas e acompanhar indicadores de estoque. A entidade principal é `produtos`. Confirmar com o professor se o tema está disponível para o grupo.

## Banco escolhido e justificativa

Foi escolhido SQLite porque o trabalho utiliza registros estruturados e relacionamentos entre produtos, categorias e movimentações. O SQLite mantém tudo em um arquivo local, dispensa instalar um servidor de banco separado e oferece SQL, chaves estrangeiras e transações. As vendas e entradas são gravadas junto com a mudança do estoque, garantindo que ambas as operações sejam concluídas ou revertidas juntas. Os preços são inteiros em centavos, evitando erros comuns de arredondamento ao armazenar valores monetários.

O modelo tem três tabelas:

- `categorias`: id e nome; uma categoria pode ter vários produtos.
- `produtos`: id, nome, categoria_id, preco_centavos, estoque e estoque_minimo.
- `movimentacoes`: id, produto_id, tipo, quantidade, preco_centavos e data. Um produto pode ter várias movimentações.

A principal limitação é o suporte a várias escritas simultâneas: em uma aplicação comercial com muitos usuários, um banco como PostgreSQL seria mais adequado. O sistema é local e acadêmico; não implementa autenticação, emissão de notas fiscais, pagamentos ou gestão contábil. O histórico impede a exclusão de produtos movimentados, preservando a integridade das vendas.

## Tecnologias e arquitetura

HTML, CSS e JavaScript puro no navegador → Fetch API → servidor HTTP Node.js → SQLite. O servidor foi implementado com `node:http` e `node:sqlite`, sem frameworks nem serviços externos. Express é recomendado na proposta, mas não obrigatório. A página e a API usam a mesma origem, portanto não é necessário configurar CORS.

## Como executar

1. Instale Node.js **22.13 ou superior** (recomenda-se Node.js 24 LTS), com npm. A versão 22 pode exibir aviso experimental sobre SQLite; isso não impede a execução.
2. Extraia o ZIP ou clone o repositório. Abra um terminal na pasta que contém `package.json`.
3. Execute `npm run banco`. O script cria `banco/erp.sqlite`, as três tabelas e os dez produtos iniciais. Repetir o comando não duplica nem apaga dados.
4. Execute `npm start` e mantenha o terminal aberto.
5. Acesse http://127.0.0.1:3000 no navegador. Não abra o HTML diretamente pelo explorador de arquivos.
6. Para encerrar, pressione Ctrl+C no terminal. Para reiniciar, use `npm start` novamente.

Não é necessário `npm install`, pois o projeto utiliza apenas módulos nativos. Não apague `banco/erp.sqlite` se quiser preservar os registros. O arquivo é criado localmente e não deve ser enviado ao GitHub; os scripts SQL reproduzem o banco.

## Rotas da API

| Método | Rota | Função |
|---|---|---|
| GET | `/api/produtos` | Lista produtos |
| GET | `/api/produtos?nome=mouse` | Filtra por nome ou categoria |
| GET | `/api/produtos/:id` | Consulta um produto |
| POST | `/api/produtos` | Cadastra um produto |
| PUT | `/api/produtos/:id` | Atualiza nome, categoria, preço e estoque mínimo |
| DELETE | `/api/produtos/:id` | Exclui produto sem movimentações |
| GET | `/api/categorias` | Lista categorias |
| GET | `/api/movimentacoes` | Lista entradas e vendas |
| POST | `/api/movimentacoes` | Registra uma entrada ou venda |
| GET | `/api/relatorio` | Calcula indicadores no banco |

### Exemplos de corpo JSON

Cadastro de produto (`POST /api/produtos`):

```json
{"nome":"Lápis","categoria_id":1,"preco_centavos":250,"estoque":20,"estoque_minimo":5}
```

Edição (`PUT /api/produtos/:id`):

```json
{"nome":"Lápis HB","categoria_id":1,"preco_centavos":300,"estoque_minimo":5}
```

Entrada ou venda (`POST /api/movimentacoes`):

```json
{"produto_id":1,"tipo":"venda","quantidade":2}
```

Use `Content-Type: application/json` nas requisições com corpo. Os números devem ser enviados como números JSON, não strings. As operações retornam JSON e códigos HTTP 200/201 (sucesso), 400 (dados inválidos), 404 (não encontrado), 409 (conflito), 413 (corpo muito grande), 415 (formato incorreto) ou 500 (erro interno).

## Testes

Execute `npm test` em outro terminal, sem precisar parar o servidor principal. Os testes criam um banco temporário e iniciam um servidor isolado, verificando dados iniciais, CRUD, filtros, erros, entradas, vendas, proteção de estoque e persistência após reinício. Não alteram o banco de trabalho.

## Organização dos arquivos

```text
mini-erp/
  banco/
    schema.sql       estrutura das tabelas
    dados.sql        registros iniciais
  public/
    index.html       estrutura da interface
    style.css        layout e responsividade
    app.js           comunicação com a API e DOM
  tests/
    api.test.js      testes automatizados
  banco.js           conexão e inicialização
  produtos.js        funções CRUD e validações
  estoque.js         movimentações e relatório
  servidor.js        servidor HTTP e rotas
  package.json       comandos de execução
  TAREFAS.md         pendências da segunda etapa
  README.md          documentação do projeto
```

## Uso de IA e referências

O ChatGPT foi utilizado como apoio na definição do escopo, modelagem das tabelas, documentação e testes automatizados. O grupo deve revisar, compreender, executar e completar as funções restantes, atualizando esta declaração caso utilize IA em outras etapas.

Não foram copiados trechos de tutoriais nem utilizados pacotes externos. Referências das tecnologias nativas empregadas:

- Node.js HTTP: https://nodejs.org/api/http.html
- Node.js SQLite: https://nodejs.org/api/sqlite.html
- Node.js Test Runner: https://nodejs.org/api/test.html
- SQLite: https://www.sqlite.org/lang.html
- Fetch API: https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API


