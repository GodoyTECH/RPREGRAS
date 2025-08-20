// Painel administrativo - Construmax
// ==========================
// ELEMENTOS DO DOM
// ==========================

let loggedInUser = null;

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("login-msg");

  if (!username || !password) {
    msg.textContent = "Preencha usuário e senha.";
    return;
  }

  try {
    const res = await fetch("/.netlify/functions/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      loggedInUser = data.user;
      document.getElementById("login-section").style.display = "none";
      document.getElementById("admin-section").style.display = "block";
      loadAds();
    } else {
      msg.textContent = data.message || "Usuário ou senha incorretos.";
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "Erro de conexão.";
  }
});

// CARREGAR ANÚNCIOS
async function loadAds() {
  try {
    const res = await fetch("/.netlify/functions/getAds"); // Função serverless para carregar anúncios
    const ads = await res.json();
    const ul = document.getElementById("ads-ul");
    ul.innerHTML = "";

    ads.forEach(ad => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${ad.title}</strong> - R$${ad.price} / Aluguel: R$${ad.rent} <br>
        ${ad.description} <br>
        Imagens: ${ad.images.join(", ")} <br>
        <button onclick="editAd(${ad.id})">Editar</button>
        <button onclick="deleteAd(${ad.id})">Excluir</button>
      `;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// LIMPAR FORMULÁRIO
function clearForm() {
  document.getElementById("ad-id").value = "";
  document.getElementById("ad-title").value = "";
  document.getElementById("ad-price").value = "";
  document.getElementById("ad-rent").value = "";
  document.getElementById("ad-description").value = "";
  document.getElementById("ad-images").value = "";
}
document.getElementById("clear-ad").addEventListener("click", clearForm);

// SALVAR/ATUALIZAR ANÚNCIO
document.getElementById("save-ad").addEventListener("click", async () => {
  const adData = {
    id: document.getElementById("ad-id").value,
    title: document.getElementById("ad-title").value.trim(),
    price: parseFloat(document.getElementById("ad-price").value),
    rent: parseFloat(document.getElementById("ad-rent").value),
    description: document.getElementById("ad-description").value.trim(),
    images: document.getElementById("ad-images").value.split(",").map(i => i.trim())
  };

  try {
    const res = await fetch("/.netlify/functions/saveAd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adData)
    });
    const data = await res.json();
    if (data.success) {
      clearForm();
      loadAds();
    } else {
      alert(data.message || "Erro ao salvar anúncio");
    }
  } catch (err) {
    console.error(err);
  }
});

// EDITAR E EXCLUIR
window.editAd = function(id) {
  fetch(`/.netlify/functions/getAd?id=${id}`)
    .then(res => res.json())
    .then(ad => {
      document.getElementById("ad-id").value = ad.id;
      document.getElementById("ad-title").value = ad.title;
      document.getElementById("ad-price").value = ad.price;
      document.getElementById("ad-rent").value = ad.rent;
      document.getElementById("ad-description").value = ad.description;
      document.getElementById("ad-images").value = ad.images.join(", ");
    });
};

window.deleteAd = async function(id) {
  if (!confirm("Deseja realmente excluir este anúncio?")) return;
  try {
    const res = await fetch(`/.netlify/functions/deleteAd?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) loadAds();
    else alert("Erro ao excluir anúncio");
  } catch (err) {
    console.error(err);
  }
};

