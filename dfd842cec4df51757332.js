import "./styles.css";

const apiKey = "P44NN9GJE6ECGTDQP4GP8WMCE";

window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeather(`${lat},${lon}`);
        }, error => {
            fetchWeather("Paris");
        });
    } else {
        fetchWeather("Paris");
    }
};

document.getElementById('search-button').addEventListener('click', () => {
    const city = document.getElementById('search').value;
    if (city) fetchWeather(city);
});

async function fetchWeather(location) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${apiKey}&contentType=json&lang=fr`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur lors de la récupération");

        const data = await response.json();
        const current = data.currentConditions;

        const tempC = current.temp;
        const tempF = (tempC * 9 / 5) + 32;

        document.getElementById('city-name').innerText = data.resolvedAddress;
        document.getElementById('temp-value').innerText = `${Math.round(tempC)}°C`;

        if (document.getElementById('temp-values')) {
            document.getElementById('temp-values').innerText = `${Math.round(tempF)}°F`;
        }

        document.getElementById('weather-description').innerText = current.conditions;

        // Détails
        const windKmh = current.windspeed || 0;
        document.getElementById('wind-kmh').innerText = Math.round(windKmh);
        document.getElementById('wind-mph').innerText = (windKmh / 1.609).toFixed(1);

        const precipMm = current.precip || 0;
        document.getElementById('precip-mm').innerText = precipMm;
        document.getElementById('precip-in').innerText = (precipMm / 25.4).toFixed(2);

        const visKm = current.visibility || 0;
        document.getElementById('vis-km').innerText = Math.round(visKm);
        document.getElementById('vis-mi').innerText = (visKm / 1.609).toFixed(1);

        updateIcon(current.icon);

        // Prévisions 5 jours
        const forecastContainer = document.getElementById('forecast-container');
        if (forecastContainer) {
            forecastContainer.innerHTML = ""; 
            for (let i = 1; i <= 5; i++) {
                const dayData = data.days[i];
                const date = new Date(dayData.datetime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
                const iconClass = getFontAwesomeIcon(dayData.icon);

                const dayCard = `
                    <div class="forecast-card">
                        <p class="forecast-date">${date}</p>
                        <i class="fa-solid ${iconClass}"></i>
                        <p class="forecast-temp">${Math.round(dayData.tempmax)}° / ${Math.round(dayData.tempmin)}°</p>
                    </div>
                `;
                forecastContainer.innerHTML += dayCard;
            }
        }

    } catch (error) {
        console.error("Erreur détaillée:", error);
        alert("Impossible de trouver la météo.");
    }
}

// Fonction pour l'icône principale
function updateIcon(visualCrossingIcon) {
    const iconElement = document.getElementById('weather-icon');
    if (!iconElement) return;
    iconElement.className = "fa-solid " + getFontAwesomeIcon(visualCrossingIcon);
}

// LA FONCTION QUI MANQUAIT : Correspondance universelle pour Font Awesome
function getFontAwesomeIcon(visualCrossingIcon) {
    const iconMap = {
        "snow": "fa-snowflake",
        "rain": "fa-cloud-showers-heavy",
        "fog": "fa-smog",
        "wind": "fa-wind",
        "cloudy": "fa-cloud",
        "partly-cloudy-day": "fa-cloud-sun",
        "partly-cloudy-night": "fa-cloud-moon",
        "clear-day": "fa-sun",
        "clear-night": "fa-moon"
    };
    return iconMap[visualCrossingIcon] || "fa-cloud";
}