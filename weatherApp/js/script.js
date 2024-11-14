const apiKey = 'afc4c225efaa6f5832ffa1621ac17e6c';  // Make sure this is the correct API key
const weatherImg = "https://openweathermap.org/img/wn/";


async function getWeather() {
    let city = document.getElementById('city').value;
    
    
    if (city.trim() === "") {
        city = "Almaty";
    }

    
    const geoApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    try {
        let response = await fetch(geoApiUrl);
        
        // if (!geoResponse.ok) {
        //     throw new Error('City not found or invalid API key');
        // }

        const geoData = await response.json();

        const lat = geoData.coord.lat;
        const lon = geoData.coord.lon;

        

        console.log(lat, lon);
        console.log(geoData);

        const oneCallApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&exclude&units=metric&appid=${apiKey}`;
        console.log(oneCallApiUrl);
        response = await fetch(oneCallApiUrl);
        const data = await response.json();
        console.log(data);
        displayWeatherData(data);
        updateMap(lat, lon, city);
        
    } catch (e) {

    }
}

function displayWeatherData(data) {
    const city_name = document.getElementById('city-name');
    // const city_timezone = document.getElementById('timezone');
    // const city_population = document.getElementById('population');
    // const city_sunrise = document.getElementById('sunrise');
    // const city_sunset = document.getElementById('sunset');

    city_name.textContent = data.city.name + ", " + data.city.country;
    // city_timezone.textContent = "Time-zone: " + data.city.timezone / 3600;
    // city_population.textContent = "Population: " + data.city.population;
    // city_sunrise.textContent = "Sunrise: " + new Date(data.city.sunrise * 1000).toLocaleTimeString();
    // city_sunset.textContent = "Sunset: " + new Date(data.city.sunset * 1000).toLocaleTimeString();
    // console.log(city_name, city_country, city_timezone, city_population, city_sunrise, city_sunset);

    const current_time = document.getElementById('current-time');
    const current_date = document.getElementById('current-date');
    const current_temp = document.getElementById('current-temp');
    const current_humidity = document.getElementById('current-humidity');
    const current_wind = document.getElementById('current-wind');
    const max_temp = document.getElementById('max-temp');
    const min_temp = document.getElementById('min-temp');
    const visibility = document.getElementById('visibility');
    const img = document.querySelector('.img_detail').children[1];
    const today_weather_description = document.getElementById('description');

    today_weather_description.textContent = data.list[0].weather[0].main;

    img.src = weatherImg + data.list[0].weather[0].icon + "@2x.png";

    console.log(img);
    
    const now = new Date();
    hour = now.getHours();
    minute = now.getMinutes();
    console.log(hour, minute);
    if (minute < 10) {
        minute = "0" + minute;
    }
    current_time.textContent = "Current time: " + hour + ":" + minute;
    if(hour < 10) {
        hour -= hour % 3;
        hour += "0";
    }
    const time = hour + ":00:00";
    console.log(time);
    const today_date = data.list.filter(item => item.dt_txt.includes(time));

    console.log(today_date);

    current_date.textContent = new Date(today_date[0].dt_txt).toLocaleDateString();
    current_temp.textContent = today_date[0].main.feels_like + "°C";
    current_humidity.textContent = "humidity: " + today_date[0].main.humidity + "%";
    current_wind.textContent = "wind speed: " + today_date[0].wind.speed + " m/s";
    max_temp.textContent = "max-temp: " + today_date[0].main.temp_max;
    min_temp.textContent = "min-temp: " + today_date[0].main.temp_min;
    visibility.textContent = "visibility: " + today_date[0].visibility;

    const futureDaysContainer = document.querySelector('.future_days');
    futureDaysContainer.innerHTML = ''; 

    
    const dailyForecasts = data.list.filter(entry => entry.dt_txt.includes("12:00:00")).slice(1, 6); // Next 5 days

    dailyForecasts.forEach((forecast) => {
        const date = new Date(forecast.dt_txt).toLocaleDateString();
        const temp = forecast.main.feels_like;
        const icon = forecast.weather[0].icon;
        const description = forecast.weather[0].description;

        
        const dayForecast = document.createElement('div');
        dayForecast.classList.add('day-forecast');

        dayForecast.innerHTML = `
            <div class="forecast-date">${date}</div>
            <img src="${weatherImg + icon + "@2x.png"}" alt="${description}" class="forecast-icon" />
            <div class="forecast-temp">${temp}°C</div>
            <div class="forecast-desc">${description}</div>
        `;

        futureDaysContainer.appendChild(dayForecast);
    });


}

function updateMap(lat, lon, city) {
        const mapContainer = document.getElementById('map');
        
        if (!mapContainer) {
            console.error("Map container not found.");
            return;
        }

        if (L.DomUtil.get('map')._leaflet_id) {
            L.DomUtil.get('map')._leaflet_id = null; 
        }
    

        mapContainer.innerHTML = ''; 
        const map = L.map(mapContainer).setView([lat, lon], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap',
            crossOrigin: null
        }).addTo(map);

        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`<b>${city}</b><br>Lat: ${lat}<br>Lon: ${lon}`).openPopup();

        map.invalidateSize(); 
}

window.addEventListener('DOMContentLoaded', (event) => {
    getWeather();
});
