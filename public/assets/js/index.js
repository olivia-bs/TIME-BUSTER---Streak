// URL bae da API local gerada pelo JSON Server (db.json)
const API_URL = "http://localhost:3000/tarefas";

// modal: é a caixinha que abre e sobrepõe a homepage quando 
// a gente vai adicionar ou ver os detalhes de uma tarefa

// exibe a modal de cadastro de nova tarefa
function abrirCadastro() {
  document.getElementById("overlayCadastro").style.display = "flex";
}

// oculta modal de cadastro
function fecharCadastro() {
  document.getElementById("overlayCadastro").style.display = "none";
}

// abre a modal de detalhes da tarefa
function abrirDetalhes(tarefa) {
  document.getElementById("detalhe-titulo").textContent = tarefa.titulo;
  document.getElementById("detalhe-data").textContent = "Data: " + formatarData(tarefa.data);
  document.getElementById("detalhe-descricao").textContent = "Descrição: " + tarefa.descricao;

  // define se a tarefa está marcada como completa
  const checkbox = document.getElementById("detalhe-checkbox");
  checkbox.checked = tarefa.completo;

  // quando o checkbox for alterado, atualiza a tarefa no db.json
  checkbox.onchange = () => {
    tarefa.completo = checkbox.checked;
    atualizarTarefa(tarefa);
  };

  // define ação do botão de apagar tarefa
  document.getElementById("btn-apagar").onclick = () => {
    fetch(`${API_URL}/${tarefa.id}`, { method: "DELETE" })
      .then(() => {
        fecharDetalhes(); // fecha modal
        carregarTarefas(); // recarrega os cards
      });
  };

  document.getElementById("overlayDetalhes").style.display = "flex";
}

// exibe o modal de detalhes
function fecharDetalhes() {
  document.getElementById("overlayDetalhes").style.display = "none";
}

 // salva o cadastro de uma nova tarefa no JSON Server
function salvarCadastro(event) {
  event.preventDefault();

  // pega os valores digitados no form
  const data = document.getElementById("data").value.trim();
  const titulo = document.getElementById("titulo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();

  // verifica se a data e o titulo foram preenchidos
  if (data && titulo) {
    const novaTarefa = { 
      data, 
      titulo, 
      descricao, 
      completo: false // nova tarefa sempre começa como incompleta
    };

    // envia os dados para o servidor (POST)
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaTarefa)
    })
      .then(() => {
        // fecha o modal, limpa os campos e recarrega a tela
        fecharCadastro();
        carregarTarefas();
        document.getElementById("data").value = "";
        document.getElementById("titulo").value = "";
        document.getElementById("descricao").value = "";
        atualizarStreakAoAtividade(); // Da streak
      });
  }
}

// converte a data para o formato brasileiro
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

// atualizaz o status de conclusão da tarefa (checkbox)
function alternarConclusao(tarefa, checked) {
  tarefa.completo = checked;
  atualizarTarefa(tarefa);
  atualizarStreakAoAtividade(); // Da streak
}

// envia a tarefa atualizada para o servidor
function atualizarTarefa(tarefa) {
  fetch(`${API_URL}/${tarefa.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tarefa)
  }).then(() => carregarTarefas());
}

// cria e adiciona um card de tarefa o carrossel
function adicionarCard(tarefa) {
  const card = document.createElement("div");
  card.className = "card";

  //HTML interno do card
  card.innerHTML = `
    <input 
      type="checkbox" 
      class="card-checkbox"
      ${tarefa.completo ? "checked" : ""}
    >

    <h3 class="card-titulo" style="${
      tarefa.completo ? "text-decoration: line-through;" : ""
    }">${tarefa.titulo}</h3>

    <p class="card-data">${formatarData(tarefa.data)}</p>
  `;

  // quando marca o checkbox, atualiza a tarefa
  const checkbox = card.querySelector(".card-checkbox");
  checkbox.onchange = (e) => alternarConclusao(tarefa, e.target.checked);

  // se clica no card (não na checkbox), abre os detalhes
  card.onclick = (e) => {
    if (e.target.tagName !== "INPUT") abrirDetalhes(tarefa);
  };

  // adiciona o card ao container da pagina
  document.getElementById("cards-container").appendChild(card);
}

// busca todas as tarefas do servidor e exibe os cards na tela
function carregarTarefas() {
  fetch(API_URL)
    .then(res => res.json())
    .then(tarefas => {
      const container = document.getElementById("cards-container");
      container.innerHTML = ""; // limpa o carrossel
      tarefas.forEach(adicionarCard); // adiciona os cards novamente
    });
}

// faz a rolagem dos cards horizontalmente (carrossel)
function scrollCards(direcao) {
  const container = document.getElementById("cards-container");
  const larguraCard = 240;
  container.scrollLeft += direcao * larguraCard * 2;
}

// ---------- Da strak ----------
function atualizarStreakAoAtividade() {
  let streak = JSON.parse(localStorage.getItem("streak")) || {
    streakAtual: 0,
    maiorStreak: 0,
    diasAtivos: 0,
    ultimoDia: null,
    ultimoIncremento: null
  };

  const hoje = new Date().toISOString().split("T")[0];

  if (streak.ultimoIncremento !== hoje) {
    // Streak atual
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataOntem = ontem.toISOString().split("T")[0];

    if (streak.ultimoIncremento === dataOntem) {
      streak.streakAtual += 1;
    } else {
      streak.streakAtual = 1;
    }

    // Maior streak
    if (streak.streakAtual > streak.maiorStreak) {
      streak.maiorStreak = streak.streakAtual;
    }

    // Dias ativos
    if (streak.ultimoDia !== hoje) {
      streak.diasAtivos += 1;
      streak.ultimoDia = hoje;
    }

    streak.ultimoIncremento = hoje;
    localStorage.setItem("streak", JSON.stringify(streak));
  }
}

// busca e exibe as tarefas quando o site carrega
carregarTarefas();
