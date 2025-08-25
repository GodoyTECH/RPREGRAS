
// admin.js
// --------------------------------------------------------------------
// Script da página de administração (admin.html)
// - Faz login simples no admin
// - Permite criar/editar/excluir anúncios
// - Permite alterar credenciais de login
// --------------------------------------------------------------------

let token = null; // guarda o "token" após login (aqui estático: "ok")

// Função para login
async function login(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const resp = await fetch("/.netlify/functions/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await resp.json();

    if (data.success) {
      token = data.token;
      document.getElementById("login-form").style.display = "none";
      document.getElementById("admin-panel").style.display = "block";
      carregarAnunciosAdmin();
    } else {
      alert("Usuário ou senha inválidos");
    }
  } catch (err) {
    console.error(err);
    alert("Erro no login");
  }
}

// Função para carregar anúncios no painel admin
async function carregarAnunciosAdmin() {
  const lista = document.getElementById("admin-anuncios");
  lista.innerHTML = "<p>Carregando anúncios...</p>";

  try {
    const resp = await fetch("/.netlify/functions/getAds");
    const anuncios = await resp.json();

    if (anuncios.length === 0) {
      lista.innerHTML = "<p>Nenhum anúncio cadastrado.</p>";
      return;
    }

    lista.innerHTML = anuncios
      .map(
        (ad) => `
        <div class="admin-card">
          <h3>${ad.title}</h3>
          <button onclick="editarAnuncio(${ad.id})">Editar</button>
          <button onclick="excluirAnuncio(${ad.id})">Excluir</button>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    lista.innerHTML = "<p>Erro ao carregar anúncios</p>";
  }
}

// Função para salvar anúncio (criar ou editar)
async function salvarAnuncio(event) {
  event.preventDefault();

  const id = document.getElementById("ad-id").value;
  const title = document.getElementById("ad-title").value;
  const price = document.getElementById("ad-price").value;
  const rent = document.getElementById("ad-rent").value;
  const description = document.getElementById("ad-description").value;
  const images = document
    .getElementById("ad-images")
    .value.split(",")
    .map((s) => s.trim());

  try {
    const resp = await fetch("/.netlify/functions/saveAd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title, price, rent, description, images }),
    });
    const data = await resp.json();

    if (data.success) {
      alert("Anúncio salvo com sucesso!");
      document.getElementById("ad-form").reset();
      document.getElementById("ad-id").value = "";
      carregarAnunciosAdmin();
    } else {
      alert("Erro: " + (data.error || "ao salvar"));
    }
  } catch (err) {
    console.error(err);
    alert("Erro na requisição");
  }
}

// Função para editar anúncio → carrega no formulário
async function editarAnuncio(id) {
  try {
    const resp = await fetch(`/.netlify/functions/getAd?id=${id}`);
    const ad = await resp.json();

    document.getElementById("ad-id").value = ad.id;
    document.getElementById("ad-title").value = ad.title;
    document.getElementById("ad-price").value = ad.price || "";
    document.getElementById("ad-rent").value = ad.rent || "";
    document.getElementById("ad-description").value = ad.description || "";
    document.getElementById("ad-images").value = (ad.images || []).join(",");
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar anúncio");
  }
}

// Função para excluir anúncio
async function excluirAnuncio(id) {
  if (!confirm("Tem certeza que deseja excluir?")) return;

  try {
    const resp = await fetch("/.netlify/functions/deleteAd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await resp.json();

    if (data.success) {
      alert("Anúncio excluído!");
      carregarAnunciosAdmin();
    } else {
      alert("Erro: " + (data.error || "ao excluir"));
    }
  } catch (err) {
    console.error(err);
    alert("Erro na requisição");
  }
}

// Função para alterar credenciais do admin
async function alterarCredenciais(event) {
  event.preventDefault();

  const newUser = document.getElementById("new-username").value;
  const newPass = document.getElementById("new-password").value;

  try {
    const resp = await fetch("/.netlify/functions/changeCredentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newUser, newPass }),
    });
    const data = await resp.json();

    if (data.success) {
      alert("Credenciais alteradas com sucesso!");
      document.getElementById("cred-form").reset();
    } else {
      alert("Erro: " + (data.error || "ao alterar credenciais"));
    }
  } catch (err) {
    console.error(err);
    alert("Erro na requisição");
  }
}

// Liga os botões/inputs às funções
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("save-ad").addEventListener("click", salvarAnuncio);
document.getElementById("clear-ad").addEventListener("click", () => {
  document.getElementById("ad-id").value = "";
  document.getElementById("ad-title").value = "";
  document.getElementById("ad-price").value = "";
  document.getElementById("ad-rent").value = "";
  document.getElementById("ad-description").value = "";
  document.getElementById("ad-images").value = "";
});
document.getElementById("change-credentials").addEventListener("click", alterarCredenciais);
