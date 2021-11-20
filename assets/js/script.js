$(document).ready(function() {
    const apiKey = 'dbc8f4367562773a8c66b15cdd9ed6f5';
    const $searchInput = $('#searchInput');
    const $searchBtn = $('#searchBtn');
    const $searchForm = $('#searchForm');

    function weatherRequest(cityLat, cityLon) {
        let requestUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + cityLat + '&lon=' + cityLon + '&appid=' + apiKey;

        $.ajax({
            url: requestUrl,
            method: 'GET'
        }).then(function(response) {
            console.log(response);
        }).catch(function(error) {
            console.log(error);
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
                weatherRequest(response[0].lat, response[0].lon);
            } else {
                return console.log('no');
            };
        }).catch(function(error) {
            console.log(error);
        });
    });
});
