// URL bae da API local gerada pelo JSON Server (db.json)
const API_URL = "http://localhost:3000/tarefas";
const STREAK_API_URL = "http://localhost:3000/streak";
const FOTO_PADRAO = "https://static-00.iconduck.com/assets.00/profile-circle-icon-2048x2048-cqe5466q.png"; 

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
    atualizarTarefa(tarefa).then(() => verificarStreak());
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
        verificarStreak(); // DA STREAK
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
  atualizarTarefa(tarefa)
    .then(verificarStreak) // Chama após atualização - DA STREAK
    .catch(error => console.error("Erro:", error));
}

// envia a tarefa atualizada para o servidor
function atualizarTarefa(tarefa) {
  return fetch(`${API_URL}/${tarefa.id}`, {
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

// ==========
// DA STREAK
// ==========


// Verifica e atualiza o streak quando uma ação é realizada

/**
 * Verifica e atualiza o streak quando uma ação relevante é realizada
 * (adicionar tarefa ou marcar como concluída)
 */
async function verificarStreak() {
  try {
    // 1. Obtém a data atual no formato YYYY-MM-DD
    const hoje = new Date();
    const hojeISO = hoje.toISOString().split('T')[0];
    
    // 2. Busca os dados atuais do streak
    const response = await fetch(STREAK_API_URL);
    const streakData = await response.json();
    
    console.log('[DEBUG] Dados do streak:', streakData); // Log para debug

    // 3. Se já atualizou hoje, não faz nada
    if (streakData.ultimaAtualizacao === hojeISO) {
      console.log('[DEBUG] Streak já atualizado hoje');
      return;
    }

    // 4. Calcula diferença de dias desde a última atualização
    let diffDias = 1; // Valor padrão para primeira atualização
    
    if (streakData.ultimaAtualizacao) {
      const ultimaAtualizacao = new Date(streakData.ultimaAtualizacao);
      const diffMilissegundos = hoje - ultimaAtualizacao;
      diffDias = Math.floor(diffMilissegundos / (1000 * 60 * 60 * 24));
      
      console.log(`[DEBUG] Diferença de dias: ${diffDias}`);
    }

    // 5. Prepara os novos dados do streak
    const novoStreak = {
      ...streakData,
      ultimaAtualizacao: hojeISO,
      diasAtivos: streakData.diasAtivos + 1
    };

    // 6. Atualiza o streak atual e maior streak
    if (diffDias === 1) {
      // Consecutivo: incrementa streak
      novoStreak.streakAtual = streakData.streakAtual + 1;
      novoStreak.maiorStreak = Math.max(novoStreak.streakAtual, streakData.maiorStreak);
    } else if (diffDias > 1) {
      // Quebrou a sequência: reseta streak atual
      novoStreak.streakAtual = 1;
    }
    // diffDias = 0 (mesmo dia) já foi tratado no início

    console.log('[DEBUG] Novo streak:', novoStreak);

    // 7. Atualiza no servidor
    await fetch(STREAK_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoStreak)
    });

    // 8. Atualiza a UI se estiver na página de streak
    if (window.location.pathname.includes('streak.html')) {
      atualizarUIStreak(novoStreak);
    }

  } catch (error) {
    console.error('[ERRO] Falha ao atualizar streak:', error);
  }
}

/**
 * Atualiza a interface com os dados do streak
 * @param {Object} streakData - Dados do streak
 */
function atualizarUIStreak(streakData) {
  // Atualiza todos os contadores de streak na página
  document.querySelectorAll('.contagem-streak').forEach(el => {
    el.textContent = streakData.streakAtual;
  });
  
  document.querySelector('.contagem-maior').textContent = streakData.maiorStreak;
  document.querySelector('.contagem-ativo').textContent = streakData.diasAtivos;
  
  // Atualiza foto do usuário (ou usa padrão)
  const fotoPadrao = 'https://static-00.iconduck.com/assets.00/profile-circle-icon-2048x2048-cqe5466q.png';
  document.querySelectorAll('.foto, .foto-usuario').forEach(img => {
    img.src = streakData.fotoUsuario || fotoPadrao;
  });
}

// Carrega as tarefas quando a página é aberta
carregarTarefas();