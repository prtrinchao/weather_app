
$(function () {

    function getDiaSemana(dataParam) {
        var data = new Date(dataParam);
        var dia = "";

        switch (data.getDay()) {
            case 0:
                dia = "Domingo";
                break;
            case 1:
                dia = "Segunda-Feira";
                break;
            case 2:
                dia = "Terça-Feira";
                break;
            case 3:
                dia = "Quarta-Feira";
                break;
            case 4:
                dia = "Quinta-Feira";
                break;
            case 5:
                dia = "Sexta-Feira";
                break;
            case 6:
                dia = "Sábado";
                break;
        }
        return dia;
    }

    // *** APIs ***
    // clima, previsão 12 horas e previsão 5 dias: https://developer.accuweather.com/apis
    // pegar coordenadas geográficas pelo nome da cidade: https://docs.mapbox.com/api/
    // pegar coordenadas do IP: http://www.geoplugin.net
    // gerar gráficos em JS: https://www.highcharts.com/demo


    const apiKey = "pBGaRMbaouQOj5DMRfSftL1hlun4lznz";
    const mapboxApiKey = "pk.eyJ1IjoicHJ0cmluY2hhbyIsImEiOiJja2IyZHI5MHcwY2RjMnBuOW10c2xqYTRzIn0.T_gfi--ez9LecAWlPdN0Cg";
    const language = "pt-br";

    var urlCurrentCondition = "http://dataservice.accuweather.com/currentconditions/v1/43080?apikey=" + apiKey + "&language=" + language;

    var weather = {
        cidade: "",
        estado: "",
        pais: "",
        temperatura: "",
        texto_clima: "",
        icone_clima: "",
        temperatura_min: "",
        temperatura_max: ""
    }

    function preencherClima(cidade, estado, pais, temperatura, texto_clima, icone_clima) {
        var texto_local = cidade + ", " + estado + ". " + pais;

        $("#texto_local").text(texto_local);
        $("#texto_clima").text(texto_clima);
        $("#texto_temperatura").html(String(temperatura) + "&deg;");
        $("#icone_clima").css("background-image", "url(" + icone_clima + ")");
    }



    function gerarGrafico(horas, temperatura) {
        Highcharts.chart('hourly_chart', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Temperatura hora a hora'
            },
            xAxis: {
                categories: horas
            },
            yAxis: {
                title: {
                    text: 'Temperatura (°C)'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                showInLegend: false,
                data: temperatura
            }]
        });
    }






    function preencheDiasClima(DailyForecasts) {

        $("#info_5dias").html("");



        for (var a = 0; a < DailyForecasts.length; a++) {
            var icon = (DailyForecasts[a].Day.Icon > 9) ? DailyForecasts[a].Day.Icon : '0' + DailyForecasts[a].Day.Icon;
            var imageIcon = 'https://developer.accuweather.com/sites/default/files/' + icon + '-s.png';
            var data = getDiaSemana(DailyForecasts[a].Date);

            var html = ' <div class="day col"> ';
            html += ' <div class="day_inner"> ';
            html += ' <div class="dayname"> ';
            html += data;
            html += '   </div> ';
            html += ' <div style="background-image: url(' + imageIcon + ')"class="daily_weather_icon"></div> ';
            html += '  <div class="max_min_temp">';
            html += DailyForecasts[a].Temperature.Minimum.Value + '&deg; / ' + DailyForecasts[a].Temperature.Maximum.Value + '&deg; ';
            html += ' </div> ';
            html += ' </div> ';
            html += ' </div> ';


            $("#info_5dias").append(html);

        }

    }


    function pegaClima12Horas(localCod) {
        $.ajax({

            url: "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + localCod + "?apikey=" + apiKey + "&language=" + language + "&metric=true",
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log("pegaClima12horas ", data);
                var horas = [];
                var temperatura = [];

                for (var x = 0; x < data.length; x++) {
                    var horario = new Date(data[x].DateTime).getHours();
                    horas.push(String(horario) + "h");
                    temperatura.push(data[x].Temperature.Value);

                }
                gerarGrafico(horas, temperatura);
                $('.refresh-loader').fadeOut();


            },
            error: function () {
                console.log("Erro na requisição");
                geraErro("Erro ao obter clima das próximas 12 horas");
            }
        });

    }


    function climaAtual(localCod) {

        $.ajax({
            url: "http://dataservice.accuweather.com/currentconditions/v1/" + localCod + "?apikey=" + apiKey + "&language=" + language,
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log("climaAtual ", data);

                weather.temperatura = data[0].Temperature.Metric.Value;
                weather.texto_clima = data[0].WeatherText;
                weather.icone_clima = "https://developer.accuweather.com/sites/default/files/" + ((data[0].WeatherIcon > 9) ? data[0].WeatherIcon : ("0" + data[0].WeatherIcon)) + "-s.png";
                preencherClima(weather.cidade, weather.estado, weather.pais, weather.temperatura, weather.texto_clima, weather.icone_clima);
            },
            error: function () {
                console.log("Erro na requisição");
                geraErro("Erro ao obter clima atual");
            }
        });


    }

    function pegaClimaSemanal(localCod) {

        $.ajax({
            url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + localCod + "?apikey=" + apiKey + "&language=" + language + "&metric=true",
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log("climaSemanal ", data);

                var maximum = data.DailyForecasts[0].Temperature.Maximum.Value;
                var minimun = data.DailyForecasts[0].Temperature.Minimum.Value;
                preencheDiasClima(data.DailyForecasts);
                $("#texto_max_min").html(+minimun + "&deg; / " + maximum + "&deg;");
            },
            error: function () {
                console.log("Erro na requisição");
                geraErro("Erro ao obter clima dos próximos 5 dias");
            }
        });
    }

    function getLocalization(lat, lon) {

        console.log("localizacao: " + lat + " , " + lon);
        var urlGeopositionSeach = "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + apiKey + "&q=" + lat + "%2C" + lon + "&language=" + language;

        $.ajax({
            url: urlGeopositionSeach,
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log("GetLocalization", data);

                var localCod = data.Key;

                weather.cidade = data.LocalizedName;
                weather.estado = data.AdministrativeArea.LocalizedName;
                weather.pais = data.Country.LocalizedName;

                climaAtual(localCod);
                pegaClimaSemanal(localCod);
                pegaClima12Horas(localCod);
            },
            error: function () {
                console.log("Erro na requisição");
                geraErro("Erro no código do Local");
            }
        });

    }




    function pegarCoordenadasCidade(cityParam) {

        cityParam = encodeURI(cityParam);

        $.ajax({
            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + cityParam + ".json?access_token=" + mapboxApiKey,
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log("pegarCoordenadasCidade ", data);
                var lat = data.features[0].geometry.coordinates[1];
                var lon = data.features[0].geometry.coordinates[0];

                getLocalization(lat, lon);

            },
            error: function () {
                console.log("Erro na requisição");
                geraErro("Erro na pesquisa do Local");
            }
        });


    }




    function pegarCoordenadas() {

        $.ajax({
            url: "http://www.geoplugin.net/json.gp",
            type: "GET",
            dataType: "json",
            success: function (data) {
                getLocalization(data.geoplugin_latitude, data.geoplugin_longitude);
            },
            error: function () {
                console.log("Erro na requisição");
            }
        });

    }


    function geraErro(messagem) {
        if (!messagem) {
            messagem = "Erro na Solicitação";
        }
        $(".refresh-loader").fadeOut();
        $("#aviso-erro").html(messagem);
        $("#aviso-erro").slideDown();
        window.setTimeout(function () {
            $("#aviso-erro").slideUp();
        }, 4000);
    }

     pegarCoordenadas();

    //geraErro();

    $("#search-button").click(function () {
        $('.refresh-loader').show();
        var cityParam = $("#local").val();
        if (cityParam) {
            pegarCoordenadasCidade(cityParam);
        }
        else {
            alert("Parâmetro não informado");
        }
    });


    $("#local").on('keypress', function (e) {
        if (e.which == 13) {
            $('.refresh-loader').show();
            var cityParam = $("#local").val();
            if (cityParam) {
                pegarCoordenadasCidade(cityParam);
            }
            else {
                alert("Parâmetro não informado");
            }
        }
    });



});