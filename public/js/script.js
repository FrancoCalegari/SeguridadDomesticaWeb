
const toggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

toggle.addEventListener("click", () => {
  navbar.classList.toggle("show");

  if (navbar.classList.contains("show")) {
    document.body.style.overflow = "hidden"; // bloquea scroll
  } else {
    document.body.style.overflow = ""; // restaura scroll
  }
});


let currentIndex = 0;

function moveCarousel(direction) {
  const carousel = document.getElementById('productCarousel');
  const cardWidth = carousel.querySelector('.card').offsetWidth + 20; // ancho + gap
  const totalCards = carousel.children.length;

  currentIndex += direction;

  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex >= totalCards) currentIndex = totalCards - 1;

  carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}
