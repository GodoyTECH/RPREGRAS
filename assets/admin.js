
// admin.js - Painel administrativo completo (Front-end)

// ==========================
// VARIÁVEIS DE ESTADO
// ==========================
let loggedInUser = null;

// ==========================
// LOGIN
// ==========================
document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const msg = document.getElementById('login-msg');
  msg.textContent = '';

  if (!username || !password) {
    msg.style.color = 'red';
    msg.textContent = 'Preencha usuário e senha.';
    return;
  }

  try {
    const res = await fetch('/.netlify/functions/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.status === 200 && data.success) {
      loggedInUser = data.user;
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('admin-section').style.display = 'block';
      loadAds();
    } else {
      msg.style.color = 'red';
      msg.textContent = data.message || 'Usuário ou senha incorretos';
    }
  } catch (err) {
    console.error(err);
    msg.style.color = 'red';
    msg.textContent = 'Erro de conexão';
  }
});

// ==========================
// CARREGAR ANÚNCIOS
// ==========================
async function loadAds() {
  try {
    const res = await fetch('/.netlify/functions/getAds');
    const data = await res.json();

    const ul = document.getElementById('ads-ul');
    ul.innerHTML = '';

    data.forEach(ad => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${ad.title}</strong> - R$${ad.price} / Aluguel: R$${ad.rent} <br>
        ${ad.description} <br>
        Imagens:<br>
        ${ad.images.map(img => `<img src="${img}" style="max-width:100px;margin:2px;">`).join('')}
        <br>
        <button onclick="editAd(${ad.id})">Editar</button>
        <button onclick="deleteAd(${ad.id})">Excluir</button>
      `;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// ==========================
// SALVAR / ATUALIZAR ANÚNCIO COM UPLOAD DE IMAGEM
// ==========================
document.getElementById('save-ad').addEventListener('click', async () => {
  const id = document.getElementById('ad-id').value;
  const title = document.getElementById('ad-title').value.trim();
  const price = parseFloat(document.getElementById('ad-price').value);
  const rent = parseFloat(document.getElementById('ad-rent').value);
  const description = document.getElementById('ad-description').value.trim();

  // Pegar arquivos selecionados
  const fileInput = document.getElementById('ad-images-file');
  const files = fileInput ? Array.from(fileInput.files) : [];
  const imagesBase64 = [];

  for (let file of files) {
    const base64 = await fileToBase64(file);
    imagesBase64.push(base64);
  }

  // Caso tenha URLs já preenchidas (compatibilidade com campo antigo)
  const imagesText = document.getElementById('ad-images').value.split(',').map(i => i.trim()).filter(i => i);
  const images = [...imagesBase64, ...imagesText];

  const payload = { id, title, price, rent, description, images };

  try {
    await fetch('/.netlify/functions/saveAd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    clearForm();
    loadAds();
  } catch (err) {
    console.error(err);
  }
});

// ==========================
// FUNÇÃO PARA CONVERTER ARQUIVO EM BASE64
// ==========================
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // Retorna 'data:image/png;base64,...'
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// ==========================
// LIMPAR FORMULÁRIO
// ==========================
document.getElementById('clear-ad').addEventListener('click', clearForm);
function clearForm() {
  document.getElementById('ad-id').value = '';
  document.getElementById('ad-title').value = '';
  document.getElementById('ad-price').value = '';
  document.getElementById('ad-rent').value = '';
  document.getElementById('ad-description').value = '';
  document.getElementById('ad-images').value = '';
  const fileInput = document.getElementById('ad-images-file');
  if (fileInput) fileInput.value = '';
}

// ==========================
// EDITAR ANÚNCIO
// ==========================
window.editAd = async function(id) {
  try {
    const res = await fetch(`/.netlify/functions/getAd?id=${id}`);
    const ad = await res.json();
    document.getElementById('ad-id').value = ad.id;
    document.getElementById('ad-title').value = ad.title;
    document.getElementById('ad-price').value = ad.price;
    document.getElementById('ad-rent').value = ad.rent;
    document.getElementById('ad-description').value = ad.description;
    document.getElementById('ad-images').value = ad.images.join(', ');
  } catch (err) {
    console.error(err);
  }
}

// ==========================
// EXCLUIR ANÚNCIO
// ==========================
window.deleteAd = async function(id) {
  if (!confirm('Deseja realmente excluir este anúncio?')) return;
  try {
    await fetch(`/.netlify/functions/deleteAd?id=${id}`, { method: 'DELETE' });
    loadAds();
  } catch (err) {
    console.error(err);
  }
}

// ==========================
// ALTERAR USUÁRIO E SENHA
// ==========================
document.getElementById('change-credentials').addEventListener('click', async () => {
  const newUser = document.getElementById('new-username').value.trim();
  const newPass = document.getElementById('new-password').value.trim();
  const msg = document.getElementById('cred-msg');

  if (!newUser || !newPass) {
    msg.style.color = 'red';
    msg.textContent = 'Preencha usuário e senha.';
    return;
  }

  try {
    const res = await fetch('/.netlify/functions/changeCredentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newUser, newPass })
    });

    const data = await res.json();

    if (data.success) {
      msg.style.color = 'green';
      msg.textContent = 'Usuário e senha alterados com sucesso!';
    } else {
      msg.style.color = 'red';
      msg.textContent = data.message || 'Erro ao alterar';
    }
  } catch (err) {
    console.error(err);
    msg.style.color = 'red';
    msg.textContent = 'Erro de conexão';
  }
});
