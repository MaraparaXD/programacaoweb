// base cad-a7k9
// aluno: Tiago Marapara Leão
const CHAVE = "filmes";

const form = document.getElementById("form-filme");
const lista = document.getElementById("lista");
const total = document.getElementById("total");
const btnLimpar = document.getElementById("btn-limpar");

// 3. Recuperar lista: getItem + JSON.parse (ou [] se estiver vazio)
function carregarRegistros() {
    const texto = localStorage.getItem(CHAVE);
    if (texto === null) {
        return [];
    }
    return JSON.parse(texto);
}

// 4. Salvar: JSON.stringify + setItem
function salvarRegistros(registros) {
    localStorage.setItem(CHAVE, JSON.stringify(registros));
}

// 5. Mostrar: percorrer com for...of e desenhar no DOM
function exibirRegistros() {
    const registros = carregarRegistros();
    lista.innerHTML = "";
    total.textContent = registros.length;

    if (registros.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "vazio";
        vazio.textContent = "Nenhum filme cadastrado ainda.";
        lista.appendChild(vazio);
        return;
    }

    for (const filme of registros) {
        const item = document.createElement("li");

        const titulo = document.createElement("strong");
        titulo.textContent = `${filme.titulo} (${filme.ano})`;

        const detalhes = document.createElement("span");
        detalhes.textContent = `${filme.genero} · Nota ${filme.nota}`;

        item.appendChild(titulo);
        item.appendChild(detalhes);
        lista.appendChild(item);
    }
}

// 1. Formulário: capturar valores no submit (com preventDefault)
form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // 2. Criar objeto: juntar os valores
    const filme = {
        titulo: document.getElementById("titulo").value.trim(),
        genero: document.getElementById("genero").value,
        ano: Number(document.getElementById("ano").value),
        nota: Number(document.getElementById("nota").value)
    };

    const registros = carregarRegistros();
    registros.push(filme);
    salvarRegistros(registros);

    exibirRegistros();
    form.reset();
});

// Botão para limpar os registros
btnLimpar.addEventListener("click", function () {
    if (confirm("Deseja apagar todos os filmes?")) {
        localStorage.removeItem(CHAVE);
        exibirRegistros();
    }
});

// 6. Persistir: chamar a exibição ao carregar a página
exibirRegistros();
