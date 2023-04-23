$(document).ready(function () {
    var openWeatherKey = "6531749f2d5c70a0ea2aa7d29fa546d7";
    
    var card0 = $("#date-0");
    var card1 = $("#date-1");
    var card2 = $("#date-2");
    var card3 = $("#date-3");
    var card4 = $("#date-4");
    var card5 = $("#date-5");
    
    var today = dayjs();

    console.log(today);
    
    // When the search button is clicked:
    //  Save the search value to a variable
    //  verify that the search is a valid city (if no, end)
    //  add the city to history
    //  convert city to lat/lon

    var city = "";

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
    
    function citySearch() {
        var searchUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + openWeatherKey;
        
        console.log("search (still) running...");

        fetch(searchUrl)
        .then(response => response.json())
        .then(response => {
            storeCity(response)
            console.log("search is complete");
        });
    }

    function storeCity(response) {
        console.log(response);

        // store relevant info about the city as an object
        var thisCity = {
            city: response[0].name,
            state: response[0].state,
            lat: response[0].lat,
            lon: response[0].lon
        }

        console.log(thisCity);

        var storedCities = JSON.parse(localStorage.getItem("cities")) || [];

        // push the city object to local storage
        if (storedCities.length == null) {
            localStorage.setItem("cities", JSON.stringify(thisCity));
        } else {
            storedCities.push(thisCity);
            localStorage.setItem("cities", JSON.stringify(storedCities));
        }

        console.log("stored!");
        return;
    }

    // TODO:
    // Add a function to prevent storing the same cities to local storage multiple times

    // API Geo calling
    // http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

});