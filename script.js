// Firebase Config - keep yours as is
const firebaseConfig = {
  apiKey: "cb866b577f194f5b9ccaf155c4b1cc38",
  authDomain: "weather-dashboard-71126.firebaseapp.com",
  projectId: "weather-dashboard-71126",
  storageBucket: "weather-dashboard-71126.appspot.com",
  messagingSenderId: "46804840319",
  appId: "1:46804840319:web:d5788a8f580c0d13fb344a",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
  // Auth functions
  function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => alert("Signed up!"))
      .catch((error) => alert("Error: " + error.message));
  }

  function logIn() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, password)
      .then(() => alert("Logged in!"))
      .catch((error) => alert("Error: " + error.message));
  }

  function logOut() {
    auth.signOut().then(() => alert("Logged out!"));
  }

  auth.onAuthStateChanged((user) => {
    const status = document.getElementById("auth-status");
    status.innerText = user ? `Logged in as ${user.email}` : "Not logged in";
  });

  // Expose auth functions globally for button onclicks
  window.signUp = signUp;
  window.logIn = logIn;
  window.logOut = logOut;

  // Chart.js chart instance (will be created later)
  let weatherChart = null;

  // Function to toggle dropdown
  window.toggleDropdown = function () {
    document.getElementById("dropdown-content").classList.toggle("show");
  };

  // Save and display recent searches
  function saveToRecentSearches(city) {
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    if (!searches.includes(city)) {
      searches.unshift(city);
      if (searches.length > 5) searches.pop();
      localStorage.setItem("recentSearches", JSON.stringify(searches));
    }
    displayRecentSearches();
  }

  function displayRecentSearches() {
    const list = document.getElementById("recent-searches");
    const searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    list.innerHTML = "";
    searches.forEach((city) => {
      const li = document.createElement("li");
      li.textContent = city;
      li.style.cursor = "pointer";
      li.onclick = () => {
        document.getElementById("cityInput").value = city;
        getWeather();
      };
      list.appendChild(li);
    });
  }

  displayRecentSearches();

  // Your OpenWeatherMap API key - change this if you want
  const apiKey = "cb866b577f194f5b9ccaf155c4b1cc38";

  // Main weather fetching function
  window.getWeather = function () {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
      alert("Please enter a city name.");
      return;
    }
    const unit = document.getElementById("unitSelect").value;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=${unit}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.cod !== 200) throw new Error(data.message);

        const showTemp = document.getElementById("showTemp").checked;
        const showHumidity = document.getElementById("showHumidity").checked;
        const showWind = document.getElementById("showWind").checked;

        let output = `<h2>📍 ${data.name}, ${data.sys.country}</h2>`;
        if (showTemp) output += `🌡️ Temp: ${data.main.temp}°<br>`;
        if (showHumidity) output += `💧 Humidity: ${data.main.humidity}%<br>`;
        if (showWind) output += `🌬️ Wind: ${data.wind.speed} m/s`;

        document.getElementById("weatherDisplay").innerHTML = output;
        saveToRecentSearches(city);

        // Prepare data for chart based on checkboxes
        const labels = [];
        const chartData = [];
        const colors = [];

        if (showTemp) {
          labels.push("Temperature");
          chartData.push(data.main.temp);
          colors.push("rgba(255, 99, 132, 0.6)");
        }
        if (showHumidity) {
          labels.push("Humidity");
          chartData.push(data.main.humidity);
          colors.push("rgba(54, 162, 235, 0.6)");
        }
        if (showWind) {
          labels.push("Wind Speed");
          chartData.push(data.wind.speed);
          colors.push("rgba(255, 206, 86, 0.6)");
        }

        // Update or create chart
        const canvas = document.getElementById("weatherChart");
        if (!canvas) {
          console.error("Canvas element for chart not found!");
          return;
        }
        const ctx = canvas.getContext("2d");

        if (weatherChart) {
          weatherChart.data.labels = labels;
          weatherChart.data.datasets[0].data = chartData;
          weatherChart.data.datasets[0].backgroundColor = colors;
          weatherChart.update();
        } else {
          weatherChart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: labels,
              datasets: [
                {
                  label: `Weather Data for ${data.name}`,
                  data: chartData,
                  backgroundColor: colors,
                },
              ],
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
        }
      })
      .catch((err) => {
        document.getElementById("weatherDisplay").innerHTML =
          "❌ " + err.message;
      });
  };
});

