//Construindo a base de dados
const apiPosts = axios.create({
  baseURL: "https://api.covid19api.com/"
})

const ultimoDiaMes = [31,28,31,30,31,30,31,31,30,31,30,31];


//https://api.covid19api.com/country/south-africa?from=2020-03-01T00:00:00Z&to=2020-04-01T00:00:00Z

async function listaPaises() {
  let response = await apiPosts.get("summary");
  let paises = response["data"]["Countries"].sort((a,b) => {
    return a["Country"].localeCompare (b["Country"]);
  });
  paises = paises.map(p => {return p["Country"]});
  let menuPaises = document.getElementById('cmbCountry');
  let paisesMenu = "";
  for(pais of paises){
    paisesMenu += `<option value="${pais}">${pais}</option>`;
  }
  document.getElementById("cmbCountry").innerHTML = paisesMenu;
}


listaPaises();

document.getElementById("filtro").addEventListener("click", filtraDados);

async function filtraDados(){
  let pais = document.getElementById("cmbCountry").value;
  let dataInicio = document.getElementById("date_start").value;
  let dataFinal = document.getElementById("date_end").value;

  let dataInicio_aux = dataInicio.split("-");
  let mesAux = parseInt(dataInicio_aux[1]) - 2;
  let dataInicio_aux2 = "";
  let mesAnterior_aux = parseInt(dataInicio_aux[1]) - 1; 
  let diaAnterior_aux = parseInt(dataInicio_aux[2]) - 1; 

  if (mesAnterior_aux < 10){
    mesAnterior_aux = "0" + mesAnterior_aux;
  }

  if (diaAnterior_aux < 10){
    diaAnterior_aux = "0" + diaAnterior_aux;
  }

  if (parseInt(dataInicio_aux[2]) === 1){
    dataInicio_aux2 = dataInicio_aux[0] + "-" + mesAnterior_aux + "-" + ultimoDiaMes[mesAux];
  }
  else{
    dataInicio_aux2 = dataInicio_aux[0] + "-" + dataInicio_aux[1] + "-" + diaAnterior_aux;
  }
  //console.log(dataInicio_aux);
  //console.log(mesAux);
  //console.log(dataInicio_aux2);
  
  let url = `country/${pais.toLowerCase().replace(/ /g, "-")}?from=${dataInicio_aux2}T00:00:00Z&to=${dataFinal}T00:00:00Z`;
  let response = await apiPosts.get(url);
  //console.log(response.data);
  let totalMortes = 0;
  let totalConfirmados = 0;
  let totalRecuperados = 0;
  
  //console.log(response["data"]);

  let dadosCovidMortes = {
    "labels": [],
    "data": [],
    "dataMedia": []
  }

  let dadosCovidConfirmados = {
    "labels": [],
    "data": [],
    "dataMedia": []
  }

  let dadosCovidRecuperados = {
    "labels": [],
    "data": [],
    "dataMedia": []
  }

  for (let i = 1; i < response["data"].length; i++) {
    let mortesDia = 0;
    let confirmadosDia = 0;
    let recuperadosDia = 0;

    if (i!==0){
      mortesDia = response["data"][i]["Deaths"] - response["data"][i-1]["Deaths"];
      confirmadosDia = response["data"][i]["Confirmed"] - response["data"][i-1]["Confirmed"];
      recuperadosDia = response["data"][i]["Recovered"] - response["data"][i-1]["Recovered"];
    }
    
    totalMortes += mortesDia;
    totalConfirmados += confirmadosDia;
    totalRecuperados += recuperadosDia;

    //console.log("totalMortes");
    //console.log(totalMortes);

    dadosCovidMortes.labels.push(response["data"][i]["Date"].split("T")[0]);
    dadosCovidConfirmados.labels.push(response["data"][i]["Date"].split("T")[0]);
    dadosCovidRecuperados.labels.push(response["data"][i]["Date"].split("T")[0]);
    dadosCovidMortes.data.push(mortesDia);
    dadosCovidConfirmados.data.push(confirmadosDia);
    dadosCovidRecuperados.data.push(recuperadosDia);
  }  

  var mediaMortes = totalMortes / response["data"].length;
  var mediaConfirmados = totalConfirmados / response["data"].length;
  var mediaRecuperados = totalRecuperados / response["data"].length;

  for(let i = 0; i < response["data"].length; i++){
    dadosCovidMortes.dataMedia.push(mediaMortes);
    dadosCovidConfirmados.dataMedia.push(mediaConfirmados);
    dadosCovidRecuperados.dataMedia.push(mediaRecuperados);
  }
  //console.log("mediaMortes")
  //console.log(mediaMortes);
  document.getElementById("kpiconfirmed").textContent = totalConfirmados;
  document.getElementById("kpideaths").textContent = totalMortes;
  document.getElementById("kpirecovered").textContent = totalRecuperados;

  graficoMortes(dadosCovidMortes);
  graficoConfirmados(dadosCovidConfirmados);
  graficoRecuperados(dadosCovidRecuperados);
}

document.getElementById("cmbData").addEventListener("change", mudaGrafico);

function mudaGrafico(){
  let botao = document.getElementById("cmbData").value;
  //console.log(graficoMortes);

  if (botao == "Confirmed"){
    document.getElementById('linhasMortes').attributes.style.nodeValue = "display:none";
    document.getElementById('linhasRecuperados').attributes.style.nodeValue = "display:none";
    document.getElementById('linhasConfirmados').attributes.style.nodeValue = "display:block";
    }
    else if (botao == "Deaths"){
    document.getElementById('linhasMortes').attributes.style.nodeValue = "display:block";
    document.getElementById('linhasRecuperados').attributes.style.nodeValue = "display:none";
    document.getElementById('linhasConfirmados').attributes.style.nodeValue = "display:none";
    }
    else if (botao == "Recovered"){
    document.getElementById('linhasMortes').attributes.style.nodeValue = "display:none";
    document.getElementById('linhasRecuperados').attributes.style.nodeValue = "display:block";
    document.getElementById('linhasConfirmados').attributes.style.nodeValue = "display:none";

    }
}

//GRÁFICO DE LINHAS
function graficoMortes(dados){
  const ctx = document.getElementById('linhasMortes').getContext('2d');
  const myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: dados["labels"],
          datasets: [
            {
              label: ['Número de Mortes'],
              data: dados["data"],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)'
              ],
              borderWidth: 1
          },
          {
            label: ['Média de Mortes'],
            data: dados["dataMedia"],
            backgroundColor: [
                'rgba(200, 100, 50, 0)'
            ],
            borderColor: [
                'black'
            ],
            borderWidth: 1
        }
      ]
      },
      options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Curva Diária de Covid-19'
                }},
          scales: {
              y: {
                  beginAtZero: false
              }
          }
      }
  });
}

function graficoConfirmados(dados){
  const ctx = document.getElementById('linhasConfirmados').getContext('2d');
  const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dados["labels"],
        datasets: [
          {
            label: ['Casos Confirmados'],
            data: dados["data"],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        },
        {
          label: ['Média de Confirmados'],
          data: dados["dataMedia"],
          backgroundColor: [
              'rgba(200, 100, 50, 0)'
          ],
          borderColor: [
              'black'
          ],
          borderWidth: 1
      }
    ]
    },
      options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Curva Diária de Covid-19'
                }},
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });
}

function graficoRecuperados(dados){
  const ctx = document.getElementById('linhasRecuperados').getContext('2d');
  const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dados["labels"],
        datasets: [
          {
            label: ['Número de Recuperados'],
            data: dados["data"],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        },
        {
          label: ['Média de Recuperados'],
          data: dados["dataMedia"],
          backgroundColor: [
              'rgba(200, 100, 50, 0)'
          ],
          borderColor: [
              'black'
          ],
          borderWidth: 1
      }
    ]
    },
      options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Curva Diária de Covid-19'
                }},
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });
}


