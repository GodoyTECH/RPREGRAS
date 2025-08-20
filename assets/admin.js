// assets/admin.js
// Script do painel administrativo da Construmax

// ==========================
// CONFIGURAÇÃO DE LOGIN
// ==========================
const USERNAME = "admin"; // usuário padrão
const PASSWORD = "1234";   // senha padrão
const loginForm = document.getElementById("login-form");
const loginMsg = document.getElementById("login-msg");
const loginContainer = document.getElementById("login-container");
const adminPanel = document.getElementById("admin-panel");

// ==========================
// LOGIN
// ==========================
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === USERNAME && pass === PASSWORD) {
    loginContainer.style.display = "none";
    adminPanel.style.display = "block";
    carregarAnunciosAdmin();
  } else {
    loginMsg.textContent = "Usuário ou senha incorretos!";
  }
});

// ==========================
// CRUD DE ANÚNCIOS
// ==========================
const adForm = document.getElementById("ad-form");
const adsList = document.getElementById("ads-list");

// Array local de anúncios (vai substituir por DB no futuro)
let anuncios = [];

// Função para carregar anúncios do JSON ou DB
async function carregarAnunciosAdmin() {
  try {
    const resp = await fetch("data/machines.json");
    const data = await resp.json();
    anuncios = data;
    renderizarAnunciosAdmin();
  } catch (err) {
    console.error("Erro ao carregar anúncios:", err);
  }
}

// Renderiza a lista de anúncios no painel admin
function renderizarAnunciosAdmin() {
  adsList.innerHTML = "";
  if (anuncios.length === 0) {
    adsList.innerHTML = "<p>Nenhum anúncio cadastrado.</p>";
    return;
  }

  anuncios.forEach((ad) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h4>${ad.title}</h4>
      <p><strong>Preço de venda:</strong> R$ ${ad.price}</p>
      <p><strong>Aluguel/mês:</strong> R$ ${ad.rent}</p>
      <p>${ad.description}</p>
      <p><strong>Imagens:</strong> ${ad.images.join(", ")}</p>
      <button onclick="editarAnuncio(${ad.id})">Editar</button>
      <button onclick="excluirAnuncio(${ad.id})">Excluir</button>
    `;
    adsList.appendChild(div);
  });
}

// ==========================
// ADICIONAR OU EDITAR ANÚNCIO
// ==========================
adForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("ad-id").value;
  const title = document.getElementById("ad-title").value;
  const price = Number(document.getElementById("ad-price").value);
  const rent = Number(document.getElementById("ad-rent").value);
  const description = document.getElementById("ad-description").value;
  const images = document.getElementById("ad-images").value
    .split(",")
    .map((img) => img.trim())
