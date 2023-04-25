$(document).ready(function () {
    var openWeatherKey = "6531749f2d5c70a0ea2aa7d29fa546d7";
    
    
    var card1 = $("#date-1");
    var card2 = $("#date-2");
    var card3 = $("#date-3");
    var card4 = $("#date-4");
    var card5 = $("#date-5");
    
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

    $("#search-btn").click(function() {
        console.log("search is running"); // delete
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
        var searchUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + openWeatherKey;
        
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
        
        var searchUrlFiveDay = "http://api.openweathermap.org/data/2.5/forecast?lat=" + thisCity.lat + "&lon=" + thisCity.lon + "&appid=" + openWeatherKey + "&units=imperial";

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
            console.log("wow look at all this cool data weather we have for right now!");
        });
    }

    function renderWeatherFiveDay(data) {
        console.log(data);
    }

    // add our weather data to the page
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
    }
});