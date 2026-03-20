import {
  createIcons,
  Search,
  Menu,
} from "https://unpkg.com/lucide@latest/dist/esm/lucide.js";

// Create a configuration object with only the icons you are using
createIcons({
  icons: { Search, Menu },
});

const userMenuButton = document.querySelector(".user-menu__button");
const userMenuDropdown = document.querySelector(".user-menu__dropdown");
userMenuButton.addEventListener("click", function () {
  userMenuDropdown.classList.toggle("hidden");
});
