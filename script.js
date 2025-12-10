const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const searchForm = document.querySelector("[data-searchForm]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const grantAccessBtn = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

oldTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(newTab) {
    if (newTab !== oldTab) {
        oldTab.classList.remove("current-tab");
        newTab.classList.add("current-tab");
        oldTab = newTab;

        if (newTab === searchTab) {
            searchForm.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
        } else {
            searchForm.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coords = JSON.parse(localCoordinates);
        fetchUserWeather(coords);
    }
}

function fetchUserWeather({ lat, lon }) {
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        .then(res => res.json())
        .then(data => {
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeather(data);
        })
        .catch(() => alert("Failed to fetch weather"));
}

function renderWeather(info) {
    document.querySelector("[data-cityName]").innerText = info.name;
    document.querySelector("[data-countryIcon]").src =
        `https://flagcdn.com/144x108/${info.sys.country.toLowerCase()}.png`;

    document.querySelector("[data-weatherDesc]").innerText = info.weather[0].description;
    document.querySelector("[data-weatherIcon]").src =
        `http://openweathermap.org/img/w/${info.weather[0].icon}.png`;

    document.querySelector("[data-temp]").innerText = `${info.main.temp} °C`;
    document.querySelector("[data-windspeed]").innerText = `${info.wind.speed} m/s`;
    document.querySelector("[data-humidity]").innerText = `${info.main.humidity}%`;
    document.querySelector("[data-cloudiness]").innerText = `${info.clouds.all}%`;
}

grantAccessBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(position => {
        const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        };

        sessionStorage.setItem("user-coordinates", JSON.stringify(coords));
        fetchUserWeather(coords);
    });
});

searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const city = searchInput.value;

    if (!city) return;

    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
        .then(res => res.json())
        .then(data => {
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeather(data);
        })
        .catch(() => alert("City not found!"));
});
