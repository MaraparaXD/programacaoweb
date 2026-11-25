const { DatabaseSync } = require('node:sqlite');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

// Caminho do arquivo persistente; os testes usam um arquivo separado.
const caminho = process.env.ERP_BANCO || join(__dirname, 'banco', 'erp.sqlite');
const db = new DatabaseSync(caminho);

// Cria as tabelas e insere dados iniciais uma única vez.
function inicializarBanco() {
    db.exec('PRAGMA foreign_keys = ON');
    db.exec('BEGIN');
    try {
        const versao = db.prepare('PRAGMA user_version').get().user_version;
        if (versao === 0) {
            db.exec(readFileSync(join(__dirname, 'banco', 'schema.sql'), 'utf8'));
            db.exec(readFileSync(join(__dirname, 'banco', 'dados.sql'), 'utf8'));
            db.exec('PRAGMA user_version = 1');
        }
        db.exec('COMMIT');
    } catch (erro) {
        db.exec('ROLLBACK');
        throw erro;
    }
}

inicializarBanco();
if (require.main === module) {
    console.log('Banco inicializado: ' + caminho);
    db.close();
}
module.exports = db;
