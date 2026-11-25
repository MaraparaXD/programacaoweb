INSERT INTO categorias (id, nome) VALUES
    (1, 'Papelaria'), (2, 'Informática'), (3, 'Escritório');
INSERT INTO produtos (nome, categoria_id, preco_centavos, estoque, estoque_minimo) VALUES
    ('Caderno universitário', 1, 1890, 24, 5),
    ('Caneta azul', 1, 250, 60, 15),
    ('Bloco de notas', 1, 790, 4, 8),
    ('Papel A4 (500 folhas)', 1, 2990, 18, 5),
    ('Mouse USB', 2, 4990, 12, 4),
    ('Teclado USB', 2, 8990, 3, 4),
    ('Cabo HDMI', 2, 2590, 15, 5),
    ('Pasta organizadora', 3, 1290, 20, 5),
    ('Grampeador', 3, 2490, 8, 3),
    ('Organizador de mesa', 3, 3990, 6, 3);
