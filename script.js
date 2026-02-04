const rain = document.getElementById("rain");

function createHeart() {
  const heart = document.createElement("div");
  heart.className = "heart";

  heart.style.left = Math.random() * window.innerWidth + "px";

  const size = Math.random() * 8 + 10;
  heart.style.width = size + "px";
  heart.style.height = size + "px";

  const duration = Math.random() * 3 + 3;
  heart.style.animationDuration = duration + "s";

  rain.appendChild(heart);

  setTimeout(() => heart.remove(), duration * 1000);
}

setInterval(createHeart, 120);
