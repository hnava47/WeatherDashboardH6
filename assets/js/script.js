$(document).ready(function() {
    const apiKey = 'dbc8f4367562773a8c66b15cdd9ed6f5';
    const $searchInput = $('#searchInput');
    const $infoBanner = $('#info');
    const $searchBtn = $('#searchBtn');
    const $searchForm = $('#searchForm');
    const $currNameEl = $('#currentName');
    const $currIconEl = $('#currentIcon');
    const $currTempEl = $('#temp');
    const $currWindEl = $('#wind');
    const $currHumidEl = $('#humid');
    const $currUviEl = $('#uvi');
    const $fcDateEl = $('.fcDate');
    const $fcTempEl = $('.fcTemp');
    const $fcWindEl = $('.fcWind');
    const $fcHumidEl = $('.fcHumid');
    const $fcIconEl = $('.fcIcon');

    function oneCallRequest(cityLat, cityLon) {
        let requestUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityLat + '&lon=' + cityLon + '&units=imperial&exclude=minutely,hourly&appid=' + apiKey;

        return $.ajax({
            url: requestUrl,
            method: 'GET',
        }).then(function(response) {
            let details = {
                currDate: moment.unix(response.current.dt).format('MM/DD/YYYY'),
                currTemp: response.current.temp,
                currWind: response.current.wind_speed,
                currHumid: response.current.humidity,
                currUvi: response.current.uvi,
                currIconUrl: 'http://openweathermap.org/img/w/' + response.current.weather[0].icon + '.png'
            };

            for (let i = 1; i < 6; i++) {
                details['fCastDate_' + i] = moment.unix(response.daily[i].dt).format('MM/DD/YYYY');
                details['fCastTemp_' + i] = response.daily[i].temp.day;
                details['fCastWind_' + i] = response.daily[i].wind_speed;
                details['fCastHumid_' + i] = response.daily[i].humidity;
                details['fCastIcon_' + i] = 'http://openweathermap.org/img/w/' + response.daily[i].weather[0].icon + '.png'
            };

            return details;
        });
    };

    $searchInput.on('click', function() {
        $infoBanner.show();
    });

    $searchInput.on('input', function() {
        $searchBtn.prop('disabled', false);
    });

    $searchForm.on('submit', function(event) {
        event.preventDefault();

        $infoBanner.hide();

        let cityArray = $searchInput.val().toLowerCase().split(',');

        for (let i = 0; i < cityArray.length; i++) {
            cityArray[i] = cityArray[i].trim().replace(/ /g,'%20');
        };
        let cityVar = cityArray.join(',');
        let cityValUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityVar + '&appid=' + apiKey;

        $.ajax({
            url: cityValUrl,
            method: 'GET'
        }).then(function(response) {
            if (response.length > 0) {
                oneCallRequest(response[0].lat, response[0].lon).then(function(results) {
                    let cityName = response[0].name;
                    let cityCountry = response[0].country;

                    $currIconEl.attr('src', results.currIconUrl);

                    if ('state' in response[0]) {
                        let cityState = response[0].state;
                        $currNameEl.text(cityName + ', ' + cityState + ', ' + cityCountry + ' (' + results.currDate + ')')
                            .append($currIconEl);
                    } else {
                        $currNameEl.text(cityName + ', ' + cityCountry + ' (' + results.currDate + ')')
                            .append($currIconEl);
                    };

                    // Populating current weather details for selected location
                    $currTempEl.text(results.currTemp + '℉');
                    $currWindEl.text(results.currWind + ' MPH');
                    $currHumidEl.text(results.currHumid + '%');
                    $currUviEl.text(results.currUvi);
                    if (results.currUvi <= 2) {
                        $currUviEl.addClass('bg-success');
                    } else if (results.currUvi > 2 && results.currUvi <= 7) {
                        $currUviEl.addClass('bg-warning');
                    } else {
                        $currUviEl.addClass('bg-danger');
                    };

                    for (let i = 0; i < 5; i++) {
                        let forecastDay = i + 1;
                        let indexDate = 'fCastDate_' + forecastDay;
                        let indexTemp = 'fCastTemp_' + forecastDay;
                        let indexWind = 'fCastWind_' + forecastDay;
                        let indexHumid = 'fCastHumid_' + forecastDay;
                        let indexIcon = 'fCastIcon_' + forecastDay;

                        $fcDateEl[i].textContent = results[indexDate];
                        $fcTempEl[i].textContent = results[indexTemp] + '℉';
                        $fcWindEl[i].textContent = results[indexWind] + ' MPH';
                        $fcHumidEl[i].textContent = results[indexHumid] + '%';
                        $fcIconEl[i].src = results[indexIcon];
                    };

                });
            } else {
                return console.log('no');
            };
        }).catch(function(error) {
            console.log(error);
        });
    });
});
