// ARRAY - BASE DE DADOS NA MEMÓRIA
// Aqui ficam armazenados todos os lançamentos feitos (entradas e saídas)
let items = [];

// PEGANDO OS ELEMENTOS DO HTML PELO ID OU CLASSE
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const tipo = document.getElementById("tipo");
const botao = document.getElementById("botao");
const tbody = document.getElementById("tbody");

// Spans que mostram os totais na tela
const spanEntradas = document.querySelector(".spanEntradas");
const spanSaidas = document.querySelector(".spanSaidas");
const spanTotal = document.querySelector(".spanTotal");


// CARREGA OS DADOS DO LOCAL STORAGE QUANDO A PÁGINA ABRE
window.addEventListener("load", () => {
    // Busca os dados salvos anteriormente (se existirem)
    const dadosSalvos = localStorage.getItem("controleDeGastos");
    
    // Se encontrou algo no localStorage...
    if (dadosSalvos) {
        // Converte o texto de volta para array de objetos
        items = JSON.parse(dadosSalvos);
        // Atualiza a tabela com os itens salvos
        redesenharItems();
        // Atualiza os totais com base nos dados carregados
        atualizarTotal();
    }
});

// SALVA O ARRAY ATUAL NO LOCAL STORAGE como texto
const salvarLocalStorage = () => {
    // JSON.stringify transforma o array em texto
    localStorage.setItem("controleDeGastos", JSON.stringify(items));
};

// MUDA A COR DO BOTÃO DE ACORDO COM O TIPO SELECIONADO
tipo.addEventListener("change", () => {
    // Remove classes antigas caso já tenha uma cor aplicada
    botao.classList.remove("entrada", "saida");

    // Adiciona classe verde ou vermelha, conforme a escolha do usuário
    if (tipo.value === "Entrada") {
        botao.classList.add("entrada");
    } else if (tipo.value === "Saida") {
        botao.classList.add("saida");
    }
});

// FORMATA O VALOR ENQUANTO O USUÁRIO DIGITA
valor.addEventListener("input", (e) => {
    // Remove tudo que não é número
    let valorDigitado = e.target.value.replace(/\D/g, "");

    // Divide por 100 pra colocar as duas casas decimais
    let valorNumerico = parseFloat(valorDigitado) / 100;

    // Se for um número válido, formata
    if (!isNaN(valorNumerico)) {
        e.target.value = formatarMoeda(valorNumerico);
    } else {
        e.target.value = "";
    }
});

// EVENTO DE CLICK NO BOTÃO "INCLUIR"
botao.addEventListener("click", () => {
    // Lê os valores dos campos com .value
    // .trim remove espaços extras antes/depois do texto
    const descricaoValor = descricao.value.trim();
    const valorValor = valor.value.trim();
    const tipoValor = tipo.value.trim();

    // Validações - Preencher todos os campos e evitar valores negativos
    if (descricaoValor === "" || valorValor === "" || tipoValor === "") {
        alert("Preencha todos os campos!");
        return; // interrompe o código aqui
    };

    if (Number(valorValor) <= 0 ) {
        alert("Digite um valor maior que zero!")
        return;
    }

    // Cria um OBJETO representando o novo lançamento
    const novoItem = {
        descricao: descricaoValor, // descrição digitada
        valor: Number(valorValor.replace(/\D/g, "")) / 100, // Remove tudo que não é número e divide por 100 pra voltar ao formato decimal
        tipo: tipoValor,           // "Entrada" ou "Saida"
    };

    // Adiciona o novo objeto ao array principal
    items.push(novoItem);

    // Salva o array atualizado no localStorage
    salvarLocalStorage();

    // Limpa os campos do formulário para o próximo lançamento
    descricao.value = "";
    valor.value = "";
    tipo.value = "";

    // Remove classes de cor do botão e adiciona classe de "reset"
    botao.classList.remove("entrada", "saida");
    botao.classList.add("resetando");

    // Após 400ms, remove a classe resetando (volta pro normal)
    setTimeout(() => {
        botao.classList.remove("resetando");
    }, 400);

    // Redesenha a tabela e atualiza o total
    redesenharItems();
    atualizarTotal();
});


// FUNÇÃO RESPONSÁVEL POR REDESENHAR A TABELA COM OS ITENS ATUAIS
const redesenharItems = () => {
    // Limpa o conteúdo atual da tabela tbody
    tbody.innerHTML = "";

    // Percorre todos os itens do array como um for
    items.forEach((item, index) => {
        // Cria uma nova linha (tr)
        const tr = document.createElement("tr");

        // Cria as células (td)
        const tdDescricao = document.createElement("td");
        const tdValor = document.createElement("td");
        const tdTipo = document.createElement("td");
        const tdBotao = document.createElement("td");

        // Preenche cada célula com os dados do item
        tdDescricao.textContent = item.descricao;
        tdValor.textContent = formatarMoeda(item.valor);
        tdTipo.textContent = item.tipo;

        // Define a cor da célula de tipo verde ou vermelho
        if (item.tipo === "Entrada") {
            tdTipo.classList.add("corVerde");
        } else if (item.tipo === "Saida") {
            tdTipo.classList.add("corVermelho");
        }

        // Cria o botão de excluir
        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn-remover"; // classe opcional (p/ estilo)
        btnExcluir.innerHTML = '<i class="fas fa-trash"></i>'; // ícone de lixeira
        tdBotao.appendChild(btnExcluir);

        // Evento de clique no botão de excluir
        btnExcluir.addEventListener("click", () => {
            // Remove o item do array pela posição (index)
            items.splice(index, 1);
            // Atualiza a tabela após a remoção
            redesenharItems();
            // Recalcula os totais (já que algo foi removido)
            atualizarTotal();
            // Salva no localStorage o novo array sem o item
            salvarLocalStorage();
        });

        // Monta a linha completa adiciona as células dentro do tr
        tr.appendChild(tdDescricao);
        tr.appendChild(tdValor);
        tr.appendChild(tdTipo);
        tr.appendChild(tdBotao);

        // Adiciona a linha montada dentro do corpo da tabela
        tbody.appendChild(tr);
    });
};


// FORMATA NÚMERO EM PADRÃO DE MOEDA BRL REAL
const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
        style: "currency", // mostra como moeda
        currency: "BRL"    // moeda em reais R$
    });
};

// CALCULA E ATUALIZA OS TOTAIS NA TELA
const atualizarTotal = () => {
    let totalEntradas = 0;
    let totalSaidas = 0;

    // Percorre todos os itens e soma conforme o tipo
    items.forEach((item) => {
        if (item.tipo === "Entrada") {
            totalEntradas += item.valor;
        } else if (item.tipo === "Saida") {
            totalSaidas += item.valor;
        }
    });

    // Calcula o saldo final entradas - saídas
    const resumoTotal = totalEntradas - totalSaidas;

    // Atualiza os valores exibidos nos spans
    spanEntradas.textContent = formatarMoeda(totalEntradas);
    spanSaidas.textContent = formatarMoeda(totalSaidas);
    spanTotal.textContent = formatarMoeda(resumoTotal);
};


