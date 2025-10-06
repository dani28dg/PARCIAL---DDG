let events = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const app = document.getElementById("app");


fetch("script.json")
  .then(res => res.json())
  .then(data => {
    events = data;
    showCatalog();
  });


function showCatalog() {
  app.style.display = "grid";
  app.className = "catalog";
  app.innerHTML = events.map(e => `
    <div class="card">
      <button class="fav-btn ${favorites.includes(e.id) ? "active" : ""}" onclick="toggleFavorite('${e.id}', this)">♥</button>
      <img src="${e.images[0]}" alt="${e.title}">
      <div class="card-content">
        <h3>${e.title}</h3>
        <p>${e.city} - ${new Date(e.datetime).toLocaleDateString()}</p>
        <p><b>${e.currency} ${e.priceFrom}</b></p>
        ${
          e.soldOut
          ? "<p style='color:red'>Agotado</p>"
          : `<button onclick="addCart('${e.id}')">Agregar 🛒</button>`
        }
        <button onclick="showDetail('${e.id}')">Ver Detalle</button>
      </div>
    </div>
  `).join("");
}


function showDetail(id) {
  const e = events.find(ev => ev.id == id);
  if (!e) return;
  app.style.display = "block";
  app.className = "";
  const isFav = favorites.includes(e.id);

  const mapUrl = `https://www.google.com/maps?q=${e.coordinates[1]},${e.coordinates[0]}&output=embed`;

  app.innerHTML = `
    <div class="detail card">
      <button class="fav-btn ${isFav ? "active" : ""}" onclick="toggleFavorite('${e.id}', this)">♥</button>
      <h2>${e.title}</h2>
      <div class="gallery">
        ${e.images.map(img => `<img src="${img}" alt="${e.title}">`).join("")}
      </div>
      <p><b>Ciudad:</b> ${e.city}</p>
      <p><b>Lugar:</b> ${e.venue}</p>
      <p><b>Fecha:</b> ${new Date(e.datetime).toLocaleString()}</p>
      <div class="map-container">
        <iframe src="${mapUrl}" allowfullscreen="" loading="lazy"></iframe>
      </div>
      <p><b>Precio:</b> ${e.currency} ${e.priceFrom}</p>
      <p><b>Políticas:</b></p>
      <ul>
        ${
          e.policies
          ? (typeof e.policies === "object"
              ? Object.entries(e.policies).map(([k,v]) => `<li><b>${translatePolicy(k)}:</b> ${v}</li>`).join("")
              : `<li>${e.policies}</li>`)
          : "<li>No disponible</li>"
        }
      </ul>
      ${
        e.soldOut 
        ? "<p style='color:red'>Agotado</p>" 
        : `<button onclick="addCart('${e.id}')">Agregar al Carrito</button>`
      }
      <button onclick="showCatalog()">Volver</button>
    </div>
  `;
}

function translatePolicy(key) {
  switch(key.toLowerCase()) {
    case "age": return "Edad";
    case "refund": return "Reembolso";
    default: return key;
  }
}


function showCart() {
  app.style.display = "block";
  app.className = "";
  if (cart.length === 0) {
    app.innerHTML = `<p>Tu carrito está vacío.</p><button onclick="showCatalog()">Volver</button>`;
    return;
  }
  app.innerHTML = `
    <h2>Carrito</h2>
    <ul>
      ${cart.map((id, i) => {
        const e = events.find(ev => ev.id == id);
        return `<li>${e.title} - ${e.currency} ${e.priceFrom} 
          <button onclick="removeCart(${i})">❌</button></li>`;
      }).join("")}
    </ul>
    <button onclick="showCatalog()">Seguir Comprando</button>
  `;
}

function showFavorites() {
  app.style.display = "grid";
  app.className = "catalog";
  if (favorites.length === 0) {
    app.innerHTML = `<p>No tienes favoritos aún.</p><button onclick="showCatalog()">Volver</button>`;
    return;
  }
  app.innerHTML = favorites.map(fid => {
    const e = events.find(ev => ev.id == fid);
    if (!e) return "";
    return `
      <div class="card">
        <button class="fav-btn active" onclick="toggleFavorite('${e.id}', this)">♥</button>
        <img src="${e.images[0]}" alt="${e.title}">
        <div class="card-content">
          <h3>${e.title}</h3>
          <p>${e.city} - ${new Date(e.datetime).toLocaleDateString()}</p>
          <p><b>${e.currency} ${e.priceFrom}</b></p>
          ${
            e.soldOut
            ? "<p style='color:red'>Agotado</p>"
            : `<button onclick="addCart('${e.id}')">Agregar 🛒</button>`
          }
          <button onclick="showDetail('${e.id}')">Ver Detalle</button>
        </div>
      </div>
    `;
  }).join("");
}

function toggleFavorite(id, btn) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
    if (btn) btn.classList.remove("active");
  } else {
    favorites.push(id);
    if (btn) btn.classList.add("active");
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function addCart(id) {
  const e = events.find(ev => ev.id == id);
  if (!e || e.soldOut) {
    alert("No se puede agregar, evento agotado");
    return;
  }
  cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Agregado al carrito");
}

function removeCart(i) {
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  showCart();
}

function toggleView() {
  app.classList.toggle("list");
}

window.addEventListener("hashchange", () => {
  const h = location.hash;
  if (h === "#/cart") showCart();
  else if (h === "#/favorites") showFavorites();
  else if (h.startsWith("#/detail/")) showDetail(h.split("/")[2]);
  else showCatalog();
});