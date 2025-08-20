// assets/app.js
// Script responsável por carregar os anúncios e montar os cards dinamicamente

async function carregarAnuncios() {
  const lista = document.getElementById("anuncios-lista");
  lista.innerHTML = "<p>Carregando anúncios...</p>";

  try {
    // Tenta buscar da função Netlify (Neon DB)
    const resp = await fetch("/.netlify/functions/machines");
    if (!resp.ok) throw new Error("Erro no servidor");
    const anuncios = await resp.json();

    renderizarAnuncios(anuncios);
  } catch (err) {
    console.warn("Sem banco, carregando do JSON local:", err.message);

    // Se não houver DB, carrega do arquivo JSON local
    const resp = await fetch("data/machines.json");
    const anuncios = await resp.json();
    renderizarAnuncios(anuncios);
  }
}

function renderizarAnuncios(anuncios) {
  const lista = document.getElementById("anuncios-lista");
  lista.innerHTML = "";

  if (!anuncios || anuncios.length === 0) {
    lista.innerHTML = "<p>Nenhum anúncio disponível.</p>";
    return;
  }

  anuncios.forEach((anuncio) => {
    const card = document.createElement("div");
    card.className = "card";

    // Carrossel simples de imagens
    let imagensHTML = "";
    if (anuncio.images && anuncio.images.length > 0) {
      imagensHTML = `
        <div class="carousel">
          ${anuncio.images
            .map(
              (src, i) =>
                `<img src="${src}" class="slide ${
                  i === 0 ? "active" : ""
                }" alt="${anuncio.title}">`
            )
            .join("")}
          <button class="prev">&#10094;</button>
          <button class="next">&#10095;</button>
        </div>
      `;
    }

    card.innerHTML = `
      ${imagensHTML}
      <h3>${anuncio.title}</h3>
      <p><strong>Preço de venda:</strong> R$ ${anuncio.price}</p>
      <p><strong>Aluguel por mês:</strong> R$ ${anuncio.rent}</p>
      <p>${anuncio.description}</p>
    `;

    lista.appendChild(card);

    // Ativa os botões do carrossel
    const slides = card.querySelectorAll(".slide");
    if (slides.length > 0) {
      let index = 0;
      const prevBtn = card.querySelector(".prev");
      const nextBtn = card.querySelector(".next");

      function showSlide(i) {
        slides.forEach((s, idx) => {
          s.classList.toggle("active", idx === i);
        });
      }

      prevBtn.addEventListener("click", () => {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
      });

      nextBtn.addEventListener("click", () => {
        index = (index + 1) % slides.length;
        showSlide(index);
      });
    }
  });
}

// Executa quando a página carrega
document.addEventListener("DOMContentLoaded", carregarAnuncios);
