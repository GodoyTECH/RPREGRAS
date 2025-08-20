// assets/app.js
// Script responsável por carregar os anúncios e montar os cards dinamicamente

async function carregarAnuncios() {
  const lista = document.getElementById("anuncios-lista");
  lista.innerHTML = "<p>Carregando anúncios...</p>";

  try {
    // Busca do banco via Netlify Function
    const resp = await fetch("/.netlify/functions/getAds");
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

    // Carrossel de imagens
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
          ${
            anuncio.images.length > 1
              ? `<button class="prev">&#10094;</button>
                 <button class="next">&#10095;</button>
                 <div class="dots">
                   ${anuncio.images
                     .map(
                       (_, i) =>
                         `<span class="dot ${i === 0 ? "active" : ""}"></span>`
                     )
                     .join("")}
                 </div>`
              : ""
          }
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

    // Ativa carrossel se tiver mais de 1 imagem
    const slides = card.querySelectorAll(".slide");
    const dots = card.querySelectorAll(".dot");
    if (slides.length > 1) {
      let index = 0;
      const prevBtn = card.querySelector(".prev");
      const nextBtn = card.querySelector(".next");

      function showSlide(i) {
        slides.forEach((s, idx) => {
          s.classList.toggle("active", idx === i);
        });
        dots.forEach((d, idx) => {
          d.classList.toggle("active", idx === i);
        });
      }

      // Botões manuais
      prevBtn.addEventListener("click", () => {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
      });

      nextBtn.addEventListener("click", () => {
        index = (index + 1) % slides.length;
        showSlide(index);
      });

      // Clique nos dots
      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          index = i;
          showSlide(index);
        });
      });

      // Troca automática a cada 5s
      setInterval(() => {
        index = (index + 1) % slides.length;
        showSlide(index);
      }, 5000);
    }
  });
}

// Executa quando a página carrega
document.addEventListener("DOMContentLoaded", carregarAnuncios);

