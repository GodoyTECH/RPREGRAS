// assets/admin.js
// Painel administrativo da Construmax - versão dinâmica com Neon

// ==========================
// ELEMENTOS DO DOM
// ==========================
import { Client } from 'pg';

// Variáveis de estado
let loggedInUser = null;

// Função para criar cliente e conectar ao Neon
function getClient() {
  return new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// LOGIN
document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const msg = document.getElementById('login-msg');

  const client = getClient();
  try {
    await client.connect();
    const res = await client.query(
      'SELECT * FROM admin_user WHERE username=$1 AND password=$2',
      [username, password]
    );
    if (res.rows.length > 0) {
      loggedInUser = res.rows[0];
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('admin-section').style.display = 'block';
      loadAds();
    } else {
      msg.textContent = 'Usuário ou senha incorretos.';
    }
  } catch (err) {
    console.error(err);
    msg.textContent = 'Erro de conexão.';
  } finally {
    await client.end();
  }
});

// CARREGAR ANÚNCIOS
async function loadAds() {
  const client = getClient();
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM anuncios ORDER BY id DESC');
    const ul = document.getElementById('ads-ul');
    ul.innerHTML = '';
    res.rows.forEach(ad => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${ad.title}</strong> - R$${ad.price} / Aluguel: R$${ad.rent} <br>
        ${ad.description} <br>
        Imagens: ${ad.images.join(', ')} <br>
        <button onclick="editAd(${ad.id})">Editar</button>
        <button onclick="deleteAd(${ad.id})">Excluir</button>
      `;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

// SALVAR / ATUALIZAR ANÚNCIO
document.getElementById('save-ad').addEventListener('click', async () => {
  const id = document.getElementById('ad-id').value;
  const title = document.getElementById('ad-title').value.trim();
  const price = parseFloat(document.getElementById('ad-price').value);
  const rent = parseFloat(document.getElementById('ad-rent').value);
  const description = document.getElementById('ad-description').value.trim();
  const images = document.getElementById('ad-images').value.split(',').map(i => i.trim());

  const client = getClient();
  try {
    await client.connect();
    if (id) {
      // Atualizar
      await client.query(
        'UPDATE anuncios SET title=$1, price=$2, rent=$3, description=$4, images=$5 WHERE id=$6',
        [title, price, rent, description, images, id]
      );
    } else {
      // Inserir novo
      await client.query(
        'INSERT INTO anuncios(title, price, rent, description, images) VALUES($1,$2,$3,$4,$5)',
        [title, price, rent, description, images]
      );
    }
    clearForm();
    loadAds();
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
});

// LIMPAR FORMULÁRIO
document.getElementById('clear-ad').addEventListener('click', clearForm);
function clearForm() {
  document.getElementById('ad-id').value = '';
  document.getElementById('ad-title').value = '';
  document.getElementById('ad-price').value = '';
  document.getElementById('ad-rent').value = '';
  document.getElementById('ad-description').value = '';
  document.getElementById('ad-images').value = '';
}

// EDITAR ANÚNCIO
window.editAd = async function(id) {
  const client = getClient();
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM anuncios WHERE id=$1', [id]);
    if (res.rows.length > 0) {
      const ad = res.rows[0];
      document.getElementById('ad-id').value = ad.id;
      document.getElementById('ad-title').value = ad.title;
      document.getElementById('ad-price').value = ad.price;
      document.getElementById('ad-rent').value = ad.rent;
      document.getElementById('ad-description').value = ad.description;
      document.getElementById('ad-images').value = ad.images.join(', ');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

// EXCLUIR ANÚNCIO
window.deleteAd = async function(id) {
  if (!confirm('Deseja realmente excluir este anúncio?')) return;
  const client = getClient();
  try {
    await client.connect();
    await client.query('DELETE FROM anuncios WHERE id=$1', [id]);
    loadAds();
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

// ALTERAR USUÁRIO E SENHA
document.getElementById('change-credentials').addEventListener('click', async () => {
  const newUser = document.getElementById('new-username').value.trim();
  const newPass = document.getElementById('new-password').value.trim();
  const msg = document.getElementById('cred-msg');

  if (!newUser || !newPass) {
    msg.style.color = 'red';
    msg.textContent = 'Preencha usuário e senha.';
    return;
  }

  const client = getClient();

  }
});
