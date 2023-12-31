const api_url = "https://mindicador.cl/api/";
let myChart = null;

async function getCoins(url) {
  try {
    const monedas = await fetch(url);
    const { dolar, ivp, euro, uf, utm } = await monedas.json();
    return [dolar, ivp, euro, uf, utm];
  } catch (error) {
    throw new Error(error);
  }
}
async function renderCoinOptions(url) {
  try {
    const select_container = document.getElementById("select_coin");
    const coins = await getCoins(url);

    coins.forEach((coin_info) => {
      const option = document.createElement("option");
      option.value = coin_info["codigo"];
      option.innerText = coin_info["nombre"];
      select_container.appendChild(option);
    });
  } catch (error) {
    throw new Error(error);
  }
}

async function getCoinDetails(url, coinID) {
  try {
    if (coinID) {
      const coin = await fetch(`${url}${coinID}`);
      const { serie } = await coin.json();
      const [{ valor: coinValue }] = serie;

      return coinValue;
    } else {
      alert("Seleciona una moneda");
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function getAndCreateDataToChart(url, coinID) {
  const coin = await fetch(`${url}${coinID}`);
  const { serie } = await coin.json();

  // Data for the last 10 days
  const lastTenDaysData = serie.slice(-10);

  // Zona horizontal
  const labels = lastTenDaysData.map(({ fecha }) => {
    const date = new Date(fecha);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    return formattedDate;
  });
  // Zona vertical
  const data = lastTenDaysData.map(({ valor }) => valor);

  const datasets = [
    {
      label: "Precio últimos 10 días",
      borderColor: "rgb(255, 99, 132)",
      data,
    },
  ];

  return { labels, datasets };
}

async function renderGrafica() {
  const option_selected = document.getElementById("select_coin").value;

  const data = await getAndCreateDataToChart(api_url, option_selected);
  const config = {
    type: "line",
    data,
  };

  const canvas = document.getElementById("chart");
  canvas.style.backgroundColor = "white";

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(canvas, config);
}

async function convertCurrency() {
  const option_selected = document.getElementById("select_coin").value;
  const coinValue = await getCoinDetails(api_url, option_selected);
  const inputPesos = parseFloat(
    document.querySelector(".input-container input").value || 0
  );

  if (coinValue && inputPesos) {
    const conversion = (inputPesos / coinValue).toFixed(2);
    document.querySelector(
      ".result-container"
    ).innerText = `Resultado: $${conversion}`;
  } else {
    document.querySelector(
        ".result-container"
      ).innerText = `Resultado: $0`;
  }
}

document.getElementById("search").addEventListener("click", async (event) => {
  await convertCurrency();
  renderGrafica();
});

renderCoinOptions(api_url);
