$(document).ready(function() {
    const apiKey = 'dbc8f4367562773a8c66b15cdd9ed6f5';
    const $searchInput = $('#searchInput');
    const $searchBtn = $('#searchBtn');
    const $searchForm = $('#searchForm');
    const $currNameEl = $('#currentName');
    const $currIconEl = $('#currentIcon');

    function oneCallRequest(cityLat, cityLon, callback) {
        let requestUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityLat + '&lon=' + cityLon + '&exclude=minutely,hourly&appid=' + apiKey;

        return $.ajax({
            url: requestUrl,
            method: 'GET',
        }).then(function(response) {
            let details = {
                date: moment.unix(response.current.dt).format('MM/DD/YYYY'),
                iconUrl: 'http://openweathermap.org/img/w/' + response.current.weather[0].icon + '.png'
            };
            return details;
        });
    };

    $searchInput.on('input', function() {
        $searchBtn.prop('disabled', false);
    });

    $searchForm.on('submit', function(event) {
        event.preventDefault();

        let cityVar = $searchInput.val().toLowerCase().replace(/ /g,'');
        let cityValUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityVar + '&appid=' + apiKey;

        $.ajax({
            url: cityValUrl,
            method: 'GET'
        }).then(function(response) {
            if (response.length > 0) {
                oneCallRequest(response[0].lat, response[0].lon).then(function(results) {
                    let cityName = response[0].name;
                    let cityCountry = response[0].country;

                    $currIconEl.attr('src', results.iconUrl);

                    if ('state' in response[0]) {
                        let cityState = response[0].state;
                        $currNameEl.text(cityName + ', ' + cityState + ', ' + cityCountry + ' (' + results.date + ')')
                            .append($currIconEl);
                    } else {
                        $currNameEl.text(cityName + ', ' + cityCountry + ' (' + results.date + ')')
                            .append($currIconEl);
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
