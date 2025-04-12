
document.addEventListener("DOMContentLoaded", () => {
  const inputBusqueda = document.getElementById('busqueda');
  const btnLimpiar = document.getElementById('limpiar');
  const resultado = document.getElementById('resultado');
  const spinner = document.getElementById('spinner');

  inputBusqueda.addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarCoctel();
    mostrarSugerencias();
  });

  cargarHistorial();
});

async function buscarCoctel() {
  const criterio = document.getElementById('busqueda').value.trim();
  const resultado = document.getElementById('resultado');
  const spinner = document.getElementById('spinner');
  const btnLimpiar = document.getElementById('limpiar');

  if (!criterio) {
    alert("Por favor ingresa un criterio de búsqueda.");
    return;
  }

  guardarEnHistorial(criterio);
  resultado.innerHTML = "";
  btnLimpiar.style.display = "none";
  spinner.style.display = "block";

  try {
    let url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${criterio}`;
    let response = await fetch(url);
    let data = await response.json();

    if (!data.drinks) {
      url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${criterio}`;
      response = await fetch(url);
      data = await response.json();

      if (!data.drinks) {
        resultado.innerHTML = "<p>No se encontraron cócteles.</p>";
        spinner.style.display = "none";
        return;
      }

      for (const item of data.drinks) {
        const detalle = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${item.idDrink}`);
        const detalleData = await detalle.json();
        mostrarCoctel(detalleData.drinks[0]);
      }
    } else {
      data.drinks.forEach(coctel => mostrarCoctel(coctel));
    }

    btnLimpiar.style.display = "block";
  } catch (error) {
    resultado.innerHTML = "<p>Error al obtener los datos. Intenta de nuevo más tarde.</p>";
  } finally {
    spinner.style.display = "none";
  }
}

function mostrarCoctel(coctel) {
  const resultado = document.getElementById('resultado');
  let ingredientes = "";

  for (let i = 1; i <= 15; i++) {
    const ing = coctel[`strIngredient${i}`];
    const medida = coctel[`strMeasure${i}`];
    if (ing) {
      ingredientes += `<li>${medida || ""} ${ing}</li>`;
    }
  }

  resultado.innerHTML += `
    <div class="card">
      <h2>${coctel.strDrink}</h2>
      <img src="${coctel.strDrinkThumb}" alt="Imagen del cóctel">
      <h3>Ingredientes:</h3>
      <ul>${ingredientes}</ul>
      <h3>Instrucciones:</h3>
      <p>${coctel.strInstructionsES || coctel.strInstructions}</p>
    </div>
  `;
}

function limpiarResultados() {
  document.getElementById('resultado').innerHTML = "";
  document.getElementById('busqueda').value = "";
  document.getElementById('limpiar').style.display = "none";
}

async function buscarAleatorio() {
  const resultado = document.getElementById('resultado');
  const spinner = document.getElementById('spinner');
  const btnLimpiar = document.getElementById('limpiar');

  resultado.innerHTML = "";
  spinner.style.display = "block";
  btnLimpiar.style.display = "none";

  try {
    const res = await fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php");
    const data = await res.json();
    mostrarCoctel(data.drinks[0]);
    btnLimpiar.style.display = "block";
  } catch {
    resultado.innerHTML = "<p>Error al obtener cóctel aleatorio.</p>";
  } finally {
    spinner.style.display = "none";
  }
}

function guardarEnHistorial(criterio) {
  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  if (!historial.includes(criterio)) {
    historial.unshift(criterio);
    if (historial.length > 5) historial = historial.slice(0, 5);
    localStorage.setItem("historial", JSON.stringify(historial));
  }
  cargarHistorial();
}

function cargarHistorial() {
  const contenedor = document.getElementById("historial");
  if (!contenedor) return;

  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  contenedor.innerHTML = "<h3>Historial de búsqueda:</h3>" + historial.map(item => 
    `<button onclick="document.getElementById('busqueda').value='${item}';buscarCoctel();">${item}</button>`
  ).join(" ");
}

function mostrarSugerencias() {
  // Placeholder para sugerencias automáticas
  // Aquí podrías agregar integración futura con autosuggest o AJAX
}

function borrarHistorial() {
  localStorage.removeItem("historial");
  cargarHistorial();
}
