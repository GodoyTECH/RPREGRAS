// ==========================
// Painel Administrativo Construmax
// ==========================

// Elementos do DOM
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("login-msg");
const adminSection = document.getElementById("admin-section");
const adsList = document.getElementById("ads-ul");
const saveAdBtn = document.getElementById("save-ad");
const clearAdBtn = document.getElementById("clear-ad");
const changeCredBtn = document.getElementById("change-credentials");
const credMsg = document.getElementById("cred-msg");

// Estado do usuário logado
let loggedInUser = null;
let editingAdId = null;

// ==========================
// FUNÇÃO LOGIN
// ==========================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("/.netlify/functions/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      loggedInUser = data.admin;
      loginForm.style.display = "none";
      adminSection.style.display = "block";
      loadAds();
    } else {
      loginMsg.textContent = data.message || "Usuário ou senha incorretos!";
      loginMsg.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    loginMsg.textContent = "Erro ao conectar com o servidor!";
    loginMsg.style.color = "red";
  }
});

// ==========================
// FUNÇÃO PARA CARREGAR ANÚNCIOS
// ==========================
async function loadAds() {
  try {
    const res = await fetch("/.netlify/functions/getAds");
    const ads = await res.json();
    adsList.innerHTML = "";

    ads.forEach(ad => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${ad.title}</strong> - R$${ad.price} / Aluguel: R$${ad.rent} <br>
        ${ad.description} <br>
        Imagens: ${ad.images.join(", ")} <br>
        <button onclick="editAd(${ad.id})">Editar</button>
        <button onclick="deleteAd(${ad.id})">Excluir</button>
      `;
      adsList.appendChild(li);
    });
  } catch (err) {
    console.error("Erro ao carregar anúncios:", err);
  }
}

// ==========================
// FUNÇÃO SALVAR/ATUALIZAR ANÚNCIO
// ==========================
saveAdBtn.addEventListener("click", async () => {
  const title = document.getElementById("ad-title").value.trim();
  const price = parseFloat(document.getElementById("ad-price").value);
  const rent = parseFloat(document.getElementById("ad-rent").value);
  const description = document.getElementById("ad-description").value.trim();
  const images = document.getElementById("ad-images").value.split(",").map(i => i.trim());

  if (!title || isNaN(price) || isNaN(rent)) {
    alert("Preencha corretamente título, preço e aluguel!");
    return;
  }

  try {
    await fetch("/.netlify/functions/saveAd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingAdId,
        title,
        price,
        rent,
        description,
        images
      })
    });
    clearForm();
    loadAds();
  } catch (err) {
    console.error("Erro ao salvar anúncio:", err);
  }
});

// ==========================
// FUNÇÃO EDITAR ANÚNCIO
// ==========================
window.editAd = async (id) => {
  try {
    const res = await fetch(`/.netlify/functions/getAd?id=${id}`);
    const ad = await res.json();
    if (ad) {
      editingAdId = ad.id;
      document.getElementById("ad-title").value = ad.title;
      document.getElementById("ad-price").value = ad.price;
      document.getElementById("ad-rent").value = ad.rent;
      document.getElementById("ad-description").value = ad.description;
      document.getElementById("ad-images").value = ad.images.join(", ");
    }
  } catch (err) {
    console.error("Erro ao editar anúncio:", err);
  }
};

// ==========================
// FUNÇÃO EXCLUIR ANÚNCIO
// ==========================
window.deleteAd = async (id) => {
  if (!confirm("Deseja realmente excluir este anúncio?")) return;
  try {
    await fetch("/.netlify/functions/deleteAd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    loadAds();
  } catch (err) {
    console.error("Erro ao excluir anúncio:", err);
  }
};

// ==========================
// FUNÇÃO LIMPAR FORMULÁRIO
// ==========================
clearAdBtn.addEventListener("click", clearForm);
function clearForm() {
  editingAdId = null;
  document.getElementById("ad-title").value = "";
  document.getElementById("ad-price").value = "";
  document.getElementById("ad-rent").value = "";
  document.getElementById("ad-description").value = "";
  document.getElementById("ad-images").value = "";
}

// ==========================
// FUNÇÃO ALTERAR USUÁRIO E SENHA
// ==========================
changeCredBtn.addEventListener("click", async () => {
  const newUser = document.getElementById("new-username").value.trim();
  const newPass = document.getElementById("new-password").value.trim();

  if (!newUser || !newPass) {
    credMsg.style.color = "red";
    credMsg.textContent = "Preencha usuário e senha.";
    return;
  }

  try {
    const res = await fetch("/.netlify/functions/changeCredentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: loggedInUser.id, username: newUser, password: newPass })
    });
    const data = await res.json();
    if (data.success) {
      credMsg.style.color = "green";
      credMsg.textContent = "Credenciais alteradas com sucesso!";
      loggedInUser.username = newUser;
    } else {
      credMsg.style.color = "red";
      credMsg.textContent = data.message || "Erro ao alterar credenciais.";
    }
  } catch (err) {
    console.error(err);
    credMsg.style.color = "red";
    credMsg.textContent = "Erro ao conectar com o servidor.";
  }
});

  const client = getClient();

  }
});
