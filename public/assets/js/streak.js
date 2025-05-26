// Configurações
const STREAK_API_URL = "http://localhost:3000/streak";
const FOTO_PADRAO = "https://static-00.iconduck.com/assets.00/profile-circle-icon-2048x2048-cqe5466q.png";

// Atualiza os dados do streak na UI
function atualizarUIStreak(streakData) {
  // Atualiza contagens
  document.querySelectorAll('.contagem-streak').forEach(el => el.textContent = streakData.streakAtual);
  document.querySelector('.contagem-maior').textContent = streakData.maiorStreak;
  document.querySelector('.contagem-ativo').textContent = streakData.diasAtivos;

  // Atualiza foto do usuário
  const foto = streakData.fotoUsuario || FOTO_PADRAO;
  document.querySelectorAll('.foto, .foto-usuario').forEach(img => img.src = foto);
}

// Verifica e atualiza o streak quando uma ação é realizada
async function verificarStreak() {
  const hoje = new Date().toISOString().split('T')[0];
  const response = await fetch(STREAK_API_URL);
  const streakData = await response.json();

  // Se já atualizou hoje, não faz nada
  if (streakData.ultimaAtualizacao === hoje) return;

  const novoDados = {
    ...streakData,
    ultimaAtualizacao: hoje,
    diasAtivos: streakData.diasAtivos + 1
  };

  // Atualiza streak atual
  const diffDias = Math.floor((new Date(hoje) - new Date(streakData.ultimaAtualizacao)) / (1000 * 60 * 60 * 24));
  
  if (diffDias === 1) {
    novoDados.streakAtual = streakData.streakAtual + 1;
    novoDados.maiorStreak = Math.max(novoDados.streakAtual, streakData.maiorStreak);
  } else if (diffDias > 1) {
    novoDados.streakAtual = 1; // Reset do streak se quebrado
  }

  // Salva no servidor
  await fetch(STREAK_API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoDados)
  });

  atualizarUIStreak(novoDados);
}

// Carrega os dados do streak ao iniciar
async function carregarStreak() {
  const response = await fetch(STREAK_API_URL);
  const streakData = await response.json();
  atualizarUIStreak(streakData);
}

// Inicialização
document.addEventListener('DOMContentLoaded', carregarStreak);