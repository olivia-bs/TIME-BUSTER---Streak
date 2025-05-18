const streakEl = document.querySelectorAll(".contagem-streak");
const maiorEl = document.querySelector(".contagem-maior");
const ativoEl = document.querySelector(".contagem-ativo");
const fotoEl = document.querySelector(".foto");
const fotoUsuarioEl = document.querySelector(".foto-usuario");

// Imagem padrão de usuário
const imagemPadrao = "https://static-00.iconduck.com/assets.00/profile-circle-icon-2048x2048-cqe5466q.png";

// Obter data (YYYY-MM-DD)
function dataHoje() {
  return new Date().toISOString().split("T")[0];
}

// Carrega/Inicializa streak
function carregarStreak() {
  let dados = JSON.parse(localStorage.getItem("streak")) || {
    streakAtual: 0,
    maiorStreak: 0,
    diasAtivos: 0,
    ultimoDia: null
  };

  let hoje = dataHoje();

  // Atualiza dias ativos
  if (dados.ultimoDia !== hoje) {
    dados.diasAtivos++;
    dados.ultimoDia = hoje;
    localStorage.setItem("streak", JSON.stringify(dados));
  }

  // Atualiza elementos na tela
  streakEl.forEach(el => el.textContent = dados.streakAtual);
  maiorEl.textContent = dados.maiorStreak;
  ativoEl.textContent = dados.diasAtivos;

  // Foto do usuário
  const foto = localStorage.getItem("fotoUsuario") || imagemPadrao;
  fotoEl.src = foto;
  fotoUsuarioEl.src = foto;
}

// Carregar .nome-usuario
function carregarNomeUsuario() {
  const nomeUsuario = localStorage.getItem("nomeUsuario") || "Usuário(a)";
  const elementoNome = document.querySelector(".nome-usuario");
  if (elementoNome) {
    elementoNome.textContent = nomeUsuario;
  }
}

carregarStreak();
carregarNomeUsuario();
