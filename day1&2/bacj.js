document.getElementById("toggleMode").addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  // Change button text depending on mode
  if (document.body.classList.contains("dark-mode")) {
    this.textContent = "☀️ Light Mode";
  } else {
    this.textContent = "🌙 Dark Mode";
  }
});
