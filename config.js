(function() {
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  window.API_BASE_URL = isDevelopment
    ? "http://localhost:5000/api"
    : "https://reel-ritual-backend.onrender.com/api";

  console.log("API Base URL configured:", window.API_BASE_URL);
})();
