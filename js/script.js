const apiKey = 'b24be52ac44a24de4463d99e7ec632bb';
const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');
const forecastContainer = document.querySelector('#forecast-container'); // เพิ่มพยากรณ์
const body = document.body;

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeather(cityName);
        localStorage.setItem('lastCity', cityName); // บันทึกใน localStorage
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

// โหลดข้อมูลเมืองล่าสุดอัตโนมัติ
window.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        getWeather(lastCity);
    }
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
    forecastContainer.innerHTML = ''; // ล้างข้อมูลเก่า

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('ไม่พบข้อมูลเมืองนี้');

        const data = await response.json();
        displayWeather(data);
        changeBackgroundByWeather(data);

        getForecast(city); // เรียก API พยากรณ์
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
        body.style.background = '#777'; // พื้นหลัง default
    }
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;
    weatherInfoContainer.innerHTML = weatherHtml;
}

function changeBackgroundByWeather(data) {
    const { weather, dt, timezone } = data;
    const { main } = weather[0];
    const currentHour = new Date((dt + timezone) * 1000).getUTCHours();

    let bg = '';

    if (currentHour >= 6 && currentHour <= 18) {
        // กลางวัน
        if (main === 'Clear') bg = 'linear-gradient(to top, #a1c4fd, #c2e9fb)';
        else if (main === 'Rain') bg = 'linear-gradient(to top, #616161, #9bc5c3)';
        else bg = 'linear-gradient(to top, #e0eafc, #cfdef3)';
    } else {
        // กลางคืน
        if (main === 'Clear') bg = 'linear-gradient(to top, #434343, #000000)';
        else bg = 'linear-gradient(to top, #1f1c2c, #928dab)';
    }

    body.style.background = bg;
}

async function getForecast(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const res = await fetch(forecastUrl);
        if (!res.ok) throw new Error('ไม่สามารถโหลดพยากรณ์อากาศ');

        const data = await res.json();

        // แสดงแค่วันละ 1 ช่วงเวลา (เช่น 12:00)
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);

        forecastContainer.innerHTML = '<h3 class="text-xl mt-4 mb-2 font-semibold">พยากรณ์ 5 วัน:</h3>';
        dailyForecasts.forEach(item => {
            const date = new Date(item.dt_txt).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
            const icon = item.weather[0].icon;
            const temp = item.main.temp.toFixed(1);
            const desc = item.weather[0].description;

            const card = `
                <div class="forecast-day">
                    <p>${date}</p>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
                    <p>${temp}°C</p>
                    <p>${desc}</p>
                </div>
            `;
            forecastContainer.innerHTML += card;
        });
    } catch (err) {
        console.error(err.message);
    }
}