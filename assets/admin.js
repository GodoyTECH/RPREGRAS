// assets/admin.js
// Painel administrativo da Construmax - versão dinâmica com Neon

// ==========================
// ELEMENTOS DO DOM
// ==========================
const loginForm = document.getElementById("login-form");
const loginMsg = document.getElementById("login-msg");
const loginContainer = document.getElementById("login-container");
const adminPanel = document.getElementById("admin-panel");

const adForm = document.getElementById("ad-form");
const adsList = document.getElementById("ads-list");

const userForm = document.getElementById("user-form");
const userMsg = document.getElementById("user-msg");

// ==========================
// LOGIN
// ==========================
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/.netlify/functions/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      loginContainer.style.display = "none";
      adminPanel.style.display = "block";
      carregarAnunciosAdmin();
    } else {
      loginMsg.textContent = data.message || "Usuário ou senha incorretos";
    }
  } catch (err) {
    console.error(err);
    loginMsg.textContent = "Erro ao conectar com o servidor";
  }
});

// ==========================
// CARREGAR ANÚNCIOS
// ==========================
async function carregarAnunciosAdmin() {
  try {
    const res = await fetch("/.netlify/functions/anuncios");
    const data = await res.json();
    renderizarAnunciosAdmin(data);
  } catch (err) {
    console.error("Erro ao carregar anúncios:", err);
    adsList.innerHTML = "<p>Erro ao carregar anúncios.</p>";
  }
}

// ==========================
// RENDERIZAÇÃO
// ==========================
function renderizarAnunciosAdmin(anuncios) {
  adsList.innerHTML = "";
  if (!anuncios || anuncios.length === 0) {
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
// ADICIONAR / EDITAR ANÚNCIO
// ==========================
adForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = document.getElementById("ad-id").value;
  const title = document.getElementById("ad-title").value;
  const price = Number(document.getElementById("ad-price").value);
  const rent = Number(document.getElementById("ad-rent").value);
  const description = document.getElementById("ad-description").value;
  const images = document.getElementById("ad-images").value
    .split(",")
    .map((img) => img.trim());

  try {
    await fetch("/.netlify/functions/anuncios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id || null, title, price, rent, description, images })
    });

    adForm.reset();
    document.getElementById("ad-id").value = "";
    carregarAnunciosAdmin();
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar anúncio");
  }
});

// ==========================
// EDITAR / EXCLUIR ANÚNCIO
// ==========================
async function excluirAnuncio(id) {
  if (!confirm("Deseja realmente excluir este anúncio?")) return;

  try {
    await fetch("/.netlify/functions/anuncios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    carregarAnunciosAdmin();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir anúncio");
  }
}

async function editarAnuncio(id) {
  try {
    const res = await fetch("/.netlify/functions/anuncios");
    const anuncios = await res.json();
    const ad = anuncios.find((a) => a.id == id);
    if (!ad) return;

    document.getElementById("ad-id").value = ad.id;
    document.getElementById("ad-title").value = ad.title;
    document.getElementById("ad-price").value = ad.price;
    document.getElementById("ad-rent").value = ad.rent;
    document.getElementById("ad-description").value = ad.description;
    document.getElementById("ad-images").value = ad.images.join(", ");
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar anúncio para edição");
  }
}

// ==========================
// ALTERAR USUÁRIO/SENHA
// ==========================
userForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const oldUsername = document.getElementById("old-username").value;
  const oldPassword = document.getElementById("old-password").value;
  const newUsername = document.getElementById("new-username").value;
  const newPassword = document.getElementById("new-password").value;

  try {
    const res = await fetch("/.netlify/functions/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldUsername, oldPassword, newUsername, newPassword })
    });
    const data = await res.json();

    if (data.success) {
      userMsg.textContent = "Usuário/senha atualizados com sucesso!";
      userForm.reset();
    } else {
      userMsg.textContent = data.message || "Erro ao atualizar usuário/senha";
    }
  } catch (err) {
    console.error(err);
    userMsg.textContent = "Erro de conexão com o servidor";
  }
});
