$(document).ready(function() {
    const apiKey = 'dbc8f4367562773a8c66b15cdd9ed6f5';
    const $searchInput = $('#searchInput');
    const $infoBanner = $('#info');
    const $errBanner = $('#error');
    const $searchBtn = $('#searchBtn');
    const $searchForm = $('#searchForm');
    const $favoritesEL = $('#favorites');
    const $currNameEl = $('#currentName');
    const $currDateEl = $('#currentDate');
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
    let weather = JSON.parse(localStorage.getItem('location')) || [];

    // Init page
    refreshFavorites(generateFavorites);

    // Create reference list for autocomplete
    $.ajax({
        dataType: 'json',
        url: './assets/js/city.list.json'
    }).then(function(response) {
        // Use set to remove duplicate location names
        let citySet = new Set();
        for (var i = 0; i < response.length; i++) {
            if (response[i].state.length === 0) {
                citySet.add(response[i].name + ', ' + response[i].country);
            } else {
                citySet.add(response[i].name + ', ' + response[i].state + ', ' + response[i].country);
            };
        }
        // Change set to list so it can be referenced by autocomplete
        let cityList = [...citySet];
        // Generate function for autocomplete
        $(function() {
            $searchInput.autocomplete({
                minLength: 5,
                source: cityList
            });
        });
    });

    // Function to remove duplicate cities
    function removeDuplicates(cityLoc) {
        let uniqueLs = [];
        for (let i = 0; i < weather.length; i++) {
            if (weather[i].city !== cityLoc) {
                uniqueLs.push(weather[i]);
            }
        };
        localStorage.removeItem('location');
        localStorage.setItem('location', JSON.stringify(uniqueLs));
        weather = JSON.parse(localStorage.getItem('location'));
    };

    // Updates favorites in local storage with updated weather details
    function refreshFavorites(callback) {
        // Update existing localStorage with updated weather details
        for (let i = 0; i < weather.length; i++) {
            oneCallRequest(weather[i].lat, weather[i].lon).then(function(updateDetails) {
                weather[i].temp = updateDetails.currTemp;
                weather[i].icon = updateDetails.currIconUrl;
            });
        };
        localStorage.setItem('location', JSON.stringify(weather));

        callback();
    };

    // Generate favorites list on page
    function generateFavorites() {
        $favoritesEL.children().remove();
        for (let i = 0; i < weather.length; i++) {
            let $favBtn = $('<button>');
            let $cityDesc = $('<div>');
            let $cityTemp = $('<div>');
            let $cityIcon = $('<img>');

            $cityDesc.text(weather[i].city)
                .addClass('flex-grow-1');
            $cityTemp.text(weather[i].temp);
            $cityIcon.attr('src', weather[i].icon);

            $favBtn.attr({
                'id': i,
                'type': 'button'
            })
                .addClass('d-flex align-items-center list-group-item list-group-item-action custom-fav')
                .append($cityDesc, $cityTemp, $cityIcon);

            $favoritesEL.append($favBtn);
        };
    };

    // Populate dashboard with location weather details
    function populateWeather(results) {
        $currIconEl.attr('src', results.currIconUrl);
        $currDateEl.text('(' + results.currDate + ')');

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

        // Populating forecast weather details for selected location
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
    };

    // Call request for current and daily weather details
    function oneCallRequest(cityLat, cityLon) {
        let requestUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + cityLat + '&lon=' + cityLon + '&units=imperial&exclude=minutely,hourly&appid=' + apiKey;

        return $.ajax({
            url: requestUrl,
            method: 'GET',
        }).then(function(response) {
            let details = {
                lat:response.lat,
                lon: response.lon,
                currDate: moment.unix(response.current.dt).tz(response.timezone).format('MM/DD/YYYY'),
                currTemp: response.current.temp,
                currWind: response.current.wind_speed,
                currHumid: response.current.humidity,
                currUvi: response.current.uvi,
                currIconUrl: 'https://openweathermap.org/img/w/' + response.current.weather[0].icon + '.png'
            };

            for (let i = 1; i < 6; i++) {
                details['fCastDate_' + i] = moment.unix(response.daily[i].dt).tz(response.timezone).format('MM/DD/YYYY');
                details['fCastTemp_' + i] = response.daily[i].temp.day;
                details['fCastWind_' + i] = response.daily[i].wind_speed;
                details['fCastHumid_' + i] = response.daily[i].humidity;
                details['fCastIcon_' + i] = 'https://openweathermap.org/img/w/' + response.daily[i].weather[0].icon + '.png'
            };

            return details;
        }).catch(function (error) {
            console.log(error);
        });
    };

    // Show info banner on input click
    $searchInput.on('click', function() {
        $infoBanner.show();
    });

    // Hide info banner when click anywhere besides search input
    $('body').click(function(event) {
        if (!$(event.target).closest($searchInput).length) {
            $infoBanner.hide();
        };
    });

    // Enable search button after entering search input
    $searchInput.on('input', function() {
        $searchBtn.prop('disabled', false);
    });

    $searchForm.on('submit', function(event) {
        event.preventDefault();

        $searchInput.css("outline-style", "none");
        $infoBanner.hide();

        let cityArray = $searchInput.val().toLowerCase().split(',');

        for (let i = 0; i < cityArray.length; i++) {
            cityArray[i] = cityArray[i].trim().replace(/ /g,'%20');
        };
        let cityVar = cityArray.join(',');
        let cityValUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + cityVar + '&appid=' + apiKey;

        $.ajax({
            url: cityValUrl,
            method: 'GET'
        }).then(function(response) {
            $errBanner.hide();
            oneCallRequest(response[0].lat, response[0].lon).then(function(respDetails) {
                // Create location name
                let location = '';
                let cityName = response[0].name;
                let cityCountry = response[0].country;

                if ('state' in response[0]) {
                    let cityState = response[0].state;
                    location = cityName + ', ' + cityState + ', ' + cityCountry;
                } else {
                    location = cityName + ', ' + cityCountry;
                };
                $currNameEl.text(location);

                // Get location weather data
                populateWeather(respDetails);

                // Removes duplicate cities from favorites list
                removeDuplicates(location);

                // Set JSON for searched location
                let currentLoc = {
                    city: location,
                    temp: respDetails.currTemp,
                    icon: respDetails.currIconUrl,
                    lat: response[0].lat,
                    lon: response[0].lon
                };

                // Add searched location to local storage list
                weather.unshift(currentLoc);

                // Remove latest location if list gets larger than 6
                if (weather.length === 7) {
                    weather.pop();
                };

                // Add searched location to local storage
                localStorage.setItem('location', JSON.stringify(weather));

                // Populate favorites list
                refreshFavorites(generateFavorites);

            });
        }).catch(function(error) {
            console.log(error);
            $searchInput.css({
                'outline-style': 'solid',
                'outline-color': 'red'
            });
            $errBanner.show();
        });
    });

    // Populate dashboard with selected favorite
    $(document).on('click', '.custom-fav', function() {
        let index = parseInt(this.id);
        oneCallRequest(weather[index].lat, weather[index].lon).then(function(respDetails) {
            $currNameEl.text(weather[index].city);

            populateWeather(respDetails);
            refreshFavorites(generateFavorites);
        });
    });
});
