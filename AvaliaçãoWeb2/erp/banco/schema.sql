PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL CHECK (length(trim(nome)) > 0),
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    preco_centavos INTEGER NOT NULL CHECK (preco_centavos > 0),
    estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    estoque_minimo INTEGER NOT NULL CHECK (estoque_minimo >= 0)
);
CREATE TABLE IF NOT EXISTS movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'venda')),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_centavos INTEGER NOT NULL CHECK (preco_centavos > 0),
    data TEXT NOT NULL DEFAULT (datetime('now'))
);
