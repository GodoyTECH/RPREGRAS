// app.js
// --------------------------------------------------------------------
// Script do site público (index.html)
// - Busca os anúncios no banco via Netlify Function getAds
// - Monta dinamicamente os cards de anúncios na página
// --------------------------------------------------------------------

// Função para carregar anúncios e mostrar na tela
async function carregarAnuncios() {
  const lista = document.getElementById("anuncios-lista");
  lista.innerHTML = "<p>Carregando anúncios...</p>";

  try {
    // Faz chamada para a função Netlify que lista anúncios
    const resp = await fetch("/.netlify/functions/getAds");
    if (!resp.ok) throw new Error("Erro no servidor");

    const anuncios = await resp.json();
    if (anuncios.length === 0) {
      lista.innerHTML = "<p>Nenhum anúncio encontrado.</p>";
      return;
    }

    // Monta os cards de anúncios
    lista.innerHTML = anuncios
      .map(
        (ad) => `
        <div class="card">
          <h2>${ad.title}</h2>
          ${
            ad.images && ad.images.length > 0
              ? `<img src="${ad.images[0]}" alt="${ad.title}" />`
              : ""
          }
          <p><strong>Preço:</strong> R$ ${ad.price || "A consultar"}</p>
          ${
            ad.rent
              ? `<p><strong>Aluguel:</strong> R$ ${ad.rent}</p>`
              : ""
          }
          <p>${ad.description || ""}</p>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    lista.innerHTML = "<p>Erro ao carregar anúncios</p>";
  }
}

// Carregar anúncios quando a página abrir
document.addEventListener("DOMContentLoaded", carregarAnuncios);


