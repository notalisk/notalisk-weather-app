$(document).ready(function () {
    var openWeatherKey = "6531749f2d5c70a0ea2aa7d29fa546d7";
    
    var today = dayjs();
    
    // When the search button is clicked:
    //  Save the search value to a variable
    //  verify that the search is a valid city (if no, end)
    //  add the city to history
    //  convert city to lat/lon

    var city = "";

    var recentCities = [];

    // Populate recent cities (or update the list when a new city is searched)
    function listRecentCities () {
        var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

        if (storedCities.length == null) {
            return;
        } else {
            for (let i = 0; i < storedCities.length; i++) {
                recentCities.push(storedCities[i].city);
            }
        }

        if (recentCities.length == null) {
            return;
        } else {
            for (let i = 0; i < recentCities.length; i++) {
                // <li><a class="dropdown-item">I'm a city!</a></li>
                var dropdownUl = $("#dropdown-ul");
                var dropdownLi = document.createElement("li");
                var dropdownA = document.createElement("a");

                dropdownA.className = "dropdown-item";
                dropdownA.text = recentCities[i];

                dropdownUl.append(dropdownLi);
                dropdownLi.append(dropdownA);
            }
        }
    }

    listRecentCities();

    // click functions for recent list
    $(".dropdown-item").click(function() {
        city = this.text;
        citySearch();
    });

    // click function for search button
    $("#search-btn").click(function() {
        city = $("#city-search").val();

        // check that city has a value
        if (city === "") {
            alert("Please enter a city");
            return;
        } else {
            citySearch();
        }
    });
    
    // Run the API call to get info about the city
    function citySearch() {
        var searchUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + openWeatherKey;
        
        console.log("search (still) running...");

        fetch(searchUrl)
        .then(response => response.json())
        .then(response => {
            weatherSearch(storeCity(response));
            console.log("search is complete");
        });
    }

    function storeCity(response) {
        console.log(response);

        // var is found = bool (to keep track of if you need to add it)
        // for (cities) {if (this city is already here) {return true} else {return false}}
        // if (is found is true) {dont bother adding} otherwise

        // store relevant info about the city as an object
        var thisCity = {
            city: response[0].name,
            state: response[0].state,
            lat: response[0].lat,
            lon: response[0].lon
        };

        var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

        var isHere = false;

        // Check if the city is in storage, and if it is not, store it!
        if (storedCities.length == null) {
            localStorage.setItem("cities", JSON.stringify(thisCity));
        } else {
            for (let i = 0; i < storedCities.length; i++) {
                if (storedCities[i].city === thisCity.city) {
                    isHere = true;
                }
            }

            if (isHere === true) {
                console.log("You have already searched for this city!")
            } else {
                storedCities.push(thisCity);
                localStorage.setItem("cities", JSON.stringify(storedCities));
                console.log("stored!");
            }
        }

        return thisCity;
    }

    // TODO:
    // add a function to list the searched city in recent cities immediately (instead of only after reload)

    // API Geo calling
    // http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

    // API Weather calling
    // http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}

    // function to send lat/lon to weather API and get back weather forecast
    function weatherSearch (thisCity) {
        
        var searchUrlFiveDay = "https://api.openweathermap.org/data/2.5/forecast?lat=" + thisCity.lat + "&lon=" + thisCity.lon + "&appid=" + openWeatherKey + "&units=imperial";

        fetch(searchUrlFiveDay)
        .then(response => response.json())
        .then(response => {
            renderWeatherFiveDay(response);
            console.log("wow look at all this cool data weather we have for the next 5 days");
        });

        var searchUrlCurrent = "https://api.openweathermap.org/data/2.5/weather?lat=" + thisCity.lat + "&lon=" + thisCity.lon + "&appid=" + openWeatherKey + "&units=imperial";

        fetch(searchUrlCurrent)
        .then(response => response.json())
        .then(response => {
            renderWeatherCurrent(response);
        });
    }

    // add the future weather data to the page
    function renderWeatherFiveDay(data) {
        console.log(data);

        var futureWeather = $("#future-weather");
        var cards = futureWeather.children();

        // lets build a loop to save time (loops through cards)
        for (let i = 0; i < cards.length; i++) {
            // get elements
            var h4 = cards[i].children[0].children[0];
            var img = cards[i].children[0].children[1];
            var temp = cards[i].children[0].children[2];
            var hum = cards[i].children[0].children[3];
            var wind = cards[i].children[0].children[4];

            // set date
            var date = today.add(i + 1, "day");

            h4.innerHTML = date.format("MMM D, YYYY");

            // get data for date
            var dateData;
            for (let x = 0; dayjs(data.list[x].dt).isBefore(date.unix()) && x < 39; x++) {
                dateData = data.list[x];
            }

            console.log(dateData);

            // set everything
            img.src = "https://openweathermap.org/img/wn/" + dateData.weather[0].icon + "@2x.png";
            temp.innerHTML = "Temperature: " + dateData.main.temp + "°F";
            hum.innerHTML = "Humidity: " + dateData.main.humidity + "%";
            wind.innerHTML = "Wind Speed: " + dateData.wind.speed + "mph";
        }

        // show the cards
        futureWeather.removeClass("visually-hidden");
    }

    // add the current weather data to the page
    function renderWeatherCurrent(data) {
        var card0 = $("#date-0");
        var card0Children = card0.children();

        // set date
        card0Children[0].innerHTML = "Today (" + today.format("MMM D, YYYY") + ")";

        // set icon
        card0Children[1].src = "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";

        // set various other stats
        card0Children[2].innerHTML = "Temperature: " + data.main.temp + "°F";
        card0Children[3].innerHTML = "Humidity: " + data.main.humidity + "%";
        card0Children[4].innerHTML = "Wind Speed: " + data.wind.speed + "mph";

        // make the card visible!
        card0.parent().parent().removeClass("visually-hidden");

        // render the name of the city too for good measure
        $("#city-name")[0].innerHTML = city;
    }
});