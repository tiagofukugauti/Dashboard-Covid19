//Construindo a base de dados
const apiPosts = axios.create({
  baseURL: "https://api.covid19api.com"
})

async function carregaDados() {
  let response = await apiPosts.get("summary");
  let dadosPizza = [response["data"]["Global"]["NewConfirmed"], response["data"]["Global"]["NewDeaths"], response["data"]["Global"]["NewRecovered"]];
  let dadosBarras = {
    "labels": [],
    "data": []
  }
  let dadosPaises = response.data["Countries"].sort((a,b) => {
    return b.TotalDeaths - a.TotalDeaths;
  })
  for (let i = 0; i < 10; i++) {
    dadosBarras.labels.push(dadosPaises[i]["Country"]);
    dadosBarras.data.push(dadosPaises[i]["TotalDeaths"]);
  }  
  //KPIs
  document.getElementById("confirmed").textContent = response["data"]["Global"]["TotalConfirmed"];
  document.getElementById("death").textContent = response["data"]["Global"]["TotalDeaths"];
  document.getElementById("recovered").textContent = response["data"]["Global"]["TotalRecovered"];
  ////GRÁFICO PIZZA
  novosRegistros(dadosPizza);
  //GRÁFICO BARRAS
  top10(dadosBarras);
  //DATA DE ATUALIZAÇÃO
  let dataAtualizada = new Date;
  document.getElementById("date").innerHTML = "Data de atualização: " + dataAtualizada;
}


carregaDados();

//GRÁFICO PIZZA
function novosRegistros(dados){
  const ctx = document.getElementById('pizza').getContext('2d');
  const myChart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: ['Novos Confirmados', 'Novas Mortes', 'Novos Recuperados'],
          datasets: [{
              label: 'Novos Registros',
              data: dados,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
        plugins: {
          title: {
              display: true,
              text: 'Distribuição de Novos Casos'
          }},
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });
}

//GRÁFICO DE BARRAS
function top10(dados){
  const ctx = document.getElementById('barras').getContext('2d');
  const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: dados["labels"],
          datasets: [{
              label: 'Número de Mortes',
              data: dados["data"],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuição de Novos Casos'
                }},
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });
}
