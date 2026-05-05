    // =========================
    // Uruchamia cały kod dopiero po pełnym załadowaniu strony (żeby wszystkie elementy HTML były dostępne w DOM).
    // =========================

document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // Pobiera referencje do wszystkich kluczowych elementów UI mapy: warstwy mapy, fullscreen, przycisk fullscreen, obrazy fullscreen, przyciski pięter i widoku góra/dół, markery, legendę oraz kontrolki mapy (zoom i kontener do przesuwania).
    // =========================

    const layer = document.querySelector(".map-layer");

    const fullscreen = document.getElementById("fullscreen");
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    const fsImg1 = document.querySelector(".fs-img1");
    const fsImg2 = document.querySelector(".fs-img2");

    const floorItems = document.querySelectorAll(".pietra-item");
    const viewItems = document.querySelectorAll(".goradol-item");

    const markers = document.querySelectorAll(".map-marker");
    const legendItems = document.querySelectorAll(".legend-item");

    const mapa = document.querySelector(".mapa");
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");

    // =========================
    // Definicja warstw mapy (które obrazki należą do którego piętra), pomocnicza funkcja do pobierania elementów z DOM oraz ustawienie startowego piętra i trybu widoku.
    // =========================

    const layers = {
        "1": { g: ".img-1g", d: ".img-1d" },
        "2": { g: ".img-2g", d: ".img-2d" },
        "3": { g: ".img-3g", d: ".img-3d" },
        "4": { single: ".img-4" }
    };

    function el(sel) {
        return document.querySelector(sel);
    }

    let currentFloor = "1";
    let currentView = "both";

    // =========================
    // Zmienia widoczność warstw mapy (pięter i góra/dół) poprzez ustawianie opacity odpowiednich obrazów zależnie od wybranego piętra i trybu widoku.
    // =========================

    function updateView() {

        Object.values(layers).forEach(l => {
            if (l.g) el(l.g).style.opacity = "0";
            if (l.d) el(l.d).style.opacity = "0";
            if (l.single) el(l.single).style.opacity = "0";
        });

        const l = layers[currentFloor];
        if (!l) return;

        if (currentFloor === "4") {
            el(l.single).style.opacity = "1";
            return;
        }

        if (currentView === "top") {
            el(l.g).style.opacity = "1";
            el(l.d).style.opacity = "0.3";
        } else if (currentView === "bottom") {
            el(l.g).style.opacity = "0.3";
            el(l.d).style.opacity = "1";
        } else {
            el(l.g).style.opacity = "1";
            el(l.d).style.opacity = "1";
        }
    }

// =========================
// Przełączanie pięter
// =========================

floorItems.forEach(item => {
    item.addEventListener("click", () => {

        floorItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        currentFloor = item.dataset.view;

        updateView(currentFloor, currentView);
        updateMarkers(currentFloor);
        updateLegend(currentFloor);
        toggleViewButtons(currentFloor);
    });
});


// =========================
// Góra / dół / całość
// =========================

viewItems.forEach(item => {
    item.addEventListener("click", () => {

        if (currentFloor === "4") return;

        viewItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        currentView = item.dataset.view;

        updateView(currentFloor, currentView);
    });
});


// =========================
// Blokada przycisków na skarbcu
// =========================

function toggleViewButtons(floor) {

    viewItems.forEach(btn => {

        if (floor === "4") {
            btn.style.opacity = "0.3";
            btn.style.pointerEvents = "none";
        } else {
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
        }
    });
}

    // =========================
    // Pokazywanie i ukrywanie markerów oraz elementów legendy w zależności od wybranego piętra.
    // =========================

function updateMarkers(floor) {

    markers.forEach(m => {
        m.classList.toggle("active", m.dataset.floor === floor);
    });
}

function updateLegend(floor) {

    legendItems.forEach(item => {
        item.style.display = item.dataset.floor === floor ? "block" : "none";
    });
}

    // =========================
    // KLIK LEGENDY
    // =========================

    legendItems.forEach(item => {
    item.addEventListener("click", () => {

        legendItems.forEach(i => i.classList.remove("active"));
        markers.forEach(m => m.classList.remove("pulse"));

        item.classList.add("active");

        const targetPoint = item.dataset.target;

        const targetMarker = document.querySelector(`.map-marker[data-point="${targetPoint}"]`);

        if (targetMarker) {

            targetMarker.classList.add("pulse");
        }
    });
});

    // =========================
    // Otwieranie i zamykanie fullscreen mapy + ustawianie obrazów (góra/dół albo skarbiec) z odpowiednią przezroczystością.
    // =========================

    fullscreenBtn.addEventListener("click", () => {

        const l = layers[currentFloor];

        if (currentFloor === "4") {

            fsImg1.src = el(l.single).src;
            fsImg2.style.display = "none";

        } else {

            fsImg1.src = el(l.g).src;
            fsImg2.src = el(l.d).src;
            fsImg2.style.display = "block";

            // FIX OPACITY
            if (currentView === "top") {
                fsImg1.style.opacity = "1";
                fsImg2.style.opacity = "0.3";
            } else if (currentView === "bottom") {
                fsImg1.style.opacity = "0.3";
                fsImg2.style.opacity = "1";
            } else {
                fsImg1.style.opacity = "1";
                fsImg2.style.opacity = "1";
            }
        }

        fullscreen.style.display = "flex";
        requestAnimationFrame(() => fullscreen.classList.add("show"));
    });

    fullscreen.addEventListener("click", () => {
        fullscreen.classList.remove("show");
        setTimeout(() => fullscreen.style.display = "none", 200);
    });

    // =========================
    // Sterowanie mapą: zoom (przybliżanie/oddalanie) i przeciąganie (drag) całej mapy.
    // =========================

    let scale = 1;
    const minScale = 1;
    const maxScale = 3;

    let x = 0;
    let y = 0;

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let pointerId = null;

function render() {
    const t = `translate(${x}px, ${y}px) scale(${scale})`;
    layer.style.transform = t;
}

    zoomIn.addEventListener("click", (e) => {
        e.stopPropagation();
        scale = Math.min(scale + 0.2, maxScale);
        render();
    });

    zoomOut.addEventListener("click", (e) => {
        e.stopPropagation();
        scale = Math.max(scale - 0.2, minScale);

        if (scale === 1) {
            x = 0;
            y = 0;
        }

        render();
    });

    mapa.addEventListener("pointerdown", (e) => {

        if (e.target.closest(".zoom-controls") || e.target.closest(".fullscreen-btn")) return;

        dragging = true;
        pointerId = e.pointerId;

        mapa.setPointerCapture(pointerId);

        startX = e.clientX - x;
        startY = e.clientY - y;

        mapa.style.cursor = "grabbing";
    });

    mapa.addEventListener("pointermove", (e) => {
        if (!dragging || e.pointerId !== pointerId) return;

        x = e.clientX - startX;
        y = e.clientY - startY;

        render();
    });

    function stop(e) {
        dragging = false;
        pointerId = null;
        mapa.style.cursor = "grab";

        try {
            mapa.releasePointerCapture(e.pointerId);
        } catch {}
    }

    mapa.addEventListener("pointerup", stop);
    mapa.addEventListener("pointercancel", stop);
    mapa.addEventListener("pointerleave", stop);

    currentFloor = "1";

    updateView(currentFloor, currentView);
    updateMarkers(currentFloor);
    updateLegend(currentFloor);
    toggleViewButtons(currentFloor);
    render();
    });

    // =========================
    // Funkcja aktualizuje tekst daty na stronie (np. „dzisiaj”, „wczoraj”, „X dni temu”) na podstawie atrybutu data-date, a potem uruchamia ją po załadowaniu strony.
    // =========================

function updateDates() {

    document.querySelectorAll(".update-date").forEach(el => {

        const dateStr = el.dataset.date;
        if (!dateStr) return;

        const [year, month, day] = dateStr.split("-").map(Number);

        const past = new Date(year, month - 1, day);
        const now = new Date();

        const diffDays = Math.floor((now - past) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            el.textContent = "dzisiaj";
        } else if (diffDays === 1) {
            el.textContent = "wczoraj";
        } else {
            el.textContent = `${diffDays} dni temu`;
        }
    });
}

document.addEventListener("DOMContentLoaded", updateDates);

    // =========================
    // Ten skrypt odpowiada za nawigację strony i menu mobilne.
    // =========================


    function showPage(pageName) {

    // ukryj wszystkie strony
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // mapowanie stron
    const pageMap = {
        home: 'homePage',
        guides: 'guidesPage',
        categories: 'categoriesPage',
        about: 'aboutPage',
        'heist-guide': 'heistGuidePage'
    };

    const pageId = pageMap[pageName];

    if (pageId) {
        document.getElementById(pageId).classList.add('active');
    }

    // aktywny link w menu
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    // zabezpieczenie (kliknięty element)
    if (typeof event !== "undefined" && event.target) {
        event.target.classList.add('active');
    }

    // scroll na górę
    window.scrollTo(0, 0);

    // zamknij mobile menu
    const nav = document.getElementById('navLinks');
    if (nav) nav.classList.remove('active');
}


// =========================
// MENU MOBILNE (HAMBURGER)
// =========================

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

// =========================
// Ten skrypt odpowiada za licznik czasu do resetu napadu (poniedziałek 00:00 czasu polskiego).
// =========================



function getNextResetDate() {
    const now = new Date();

    // czas polski
    const nowPL = new Date(
        now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" })
    );

    const day = nowPL.getDay(); // 0 = niedziela, 1 = poniedziałek

    let daysToMonday = (1 - day + 7) % 7;

    // jeśli dziś poniedziałek → licz do następnego
    if (day === 1) {
        daysToMonday = 7;
    }

    const nextReset = new Date(nowPL);
    nextReset.setDate(nowPL.getDate() + daysToMonday);
    nextReset.setHours(0, 0, 0, 0);

    return nextReset;
}

function updateCountdown() {
    const elements = document.querySelectorAll(".reset-timer");

    const target = getNextResetDate();
    const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Europe/Warsaw" })
    );

    const diff = target - now;

    if (diff <= 0) {
        elements.forEach(el => el.textContent = "Reset teraz!");
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    const text = `${days}d ${hours}h ${minutes}m`;

    elements.forEach(el => {
        el.textContent = text;
    });
}

// start
updateCountdown();
setInterval(updateCountdown, 60000);



// =========================
// 
// =========================



