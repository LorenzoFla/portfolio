// Texte dynamique dans le header
const dynamicText = document.getElementById("dynamic-text");
const phrases = ["Développeur en devenir", "Passionné par l'informatique", "Créateur de solutions numériques"];
let phraseIndex = 0; // Index de la phrase actuelle
let charIndex = 0;   // Position actuelle dans la phrase
let isDeleting = false; // Indique si on est en train d'effacer
const typingSpeed = 100; // Vitesse de frappe
const pauseEnd = 100;   // Pause après la fin d'une phrase

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    let displayText;

    // Mise à jour du texte
    if (isDeleting) {
        displayText = "ㅤ" + currentPhrase.substring(0, charIndex--) + "ㅤ";
    } else {
        displayText = "ㅤ" + currentPhrase.substring(0, charIndex++) + "ㅤ";
    }

    dynamicText.textContent = displayText; // Mise à jour de l'affichage

    // Gestion des pauses et transitions
    if (!isDeleting && charIndex === currentPhrase.length) {
        // Arrêt temporaire après avoir fini d'écrire
        isDeleting = true;
        setTimeout(typeEffect, pauseEnd);
        return;
    } else if (isDeleting && charIndex === 1) {
        // Transition à la phrase suivante
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
    }

    // Rappel de la fonction avec délai ajusté
    const delay = isDeleting ? typingSpeed / 2 : typingSpeed;
    setTimeout(typeEffect, delay);
}

// Démarrage
typeEffect();



typeEffect();

/*
// Mode sombre
const toggleDarkModeButton = document.getElementById("toggle-dark-mode");
toggleDarkModeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});
*/


const checkbox = document.getElementById("checkbox");
let darkModeToggleCount = 0;
let rainbowModeTimeout;

// Fonction pour activer le mode arc-en-ciel
function activateRainbowMode() {
    document.body.classList.remove("dark-mode")
    document.body.classList.add("rainbow-mode");

    checkbox.disabled = true;
    

    // Faire clignoter les couleurs toutes les 500ms
    let colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
    let colorIndex = 0;
    const rainbowInterval = setInterval(() => {
        document.body.style.backgroundColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
    }, 500);

    // Désactiver le mode arc-en-ciel après 10 secondes
    setTimeout(() => {
        clearInterval(rainbowInterval);
        document.body.classList.remove("rainbow-mode");
        document.body.style.backgroundColor = ""; // Réinitialiser le fond
        checkbox.disabled = false
        checkbox.checked = false
    }, 5000);
}

// Gestion du dark mode et comptage des toggles
checkbox.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    darkModeToggleCount++;

    // Réinitialise le compteur après 5 secondes si l'utilisateur arrête
    clearTimeout(rainbowModeTimeout);
    rainbowModeTimeout = setTimeout(() => {
        darkModeToggleCount = 0;
    }, 300);

    // Active le mode arc-en-ciel si la condition est remplie
    if (darkModeToggleCount >= 6) {
        activateRainbowMode();
        darkModeToggleCount = 0; // Réinitialise le compteur
    }
});

const magicButton = document.getElementById("magic-button");

let isMoving = false;
let targetX, targetY;
let startX, startY;
let lastTimestamp = 0;
let gameActivated = false; // État du jeu


magicButton.addEventListener("mouseover", () => {
    // Génère une nouvelle position aléatoire pour le bouton
    const randomX = Math.random() * (window.innerWidth - magicButton.offsetWidth);
    const randomY = Math.random() * (window.innerHeight - magicButton.offsetHeight);

    // Applique la nouvelle position au bouton
    magicButton.style.position = "absolute";
    magicButton.style.left = `${randomX}px`;
    magicButton.style.top = `${randomY}px`;

    // Ajoute une classe pour l'effet visuel
    magicButton.classList.add("moving");
});

magicButton.addEventListener("click", () => {
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
    magicButton.classList.remove("moving");
});


// Détection de la combinaison de touches pour activer le jeu
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "b") { // Combinaison Ctrl + B
        gameActivated = true; // Active le jeu
        magicButton.style.display = "inline-block"; // Affiche le bouton
        alert("Le jeu est activé ! Essayez de cliquer sur le bouton.");
    }
});

