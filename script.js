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
    const legendGroups = document.querySelectorAll(".legend-group2");

    const mapa = document.querySelector(".mapa");
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");

    // =========================
    // Definicja warstw mapy (które obrazki należą do którego piętra), pomocnicza funkcja do pobierania elementów z DOM oraz ustawienie startowego piętra i trybu widoku.
    // =========================

    const layers = {
        "1": { single: ".img-1" },
        "2": { g: ".img-2g", d: ".img-2d" },
        "3": { g: ".img-3g", d: ".img-3d" },
        "4": { single: ".img-4" }
    };




// --- FS MARKERS: bezpieczna integracja markerów z fullscreen ---
(function () {
  const fullscreenEl = document.getElementById('fullscreen');
  const fsMarkersContainer = fullscreenEl ? fullscreenEl.querySelector('.fs-markers') : null;
  const fsCloseBtn = fullscreenEl ? fullscreenEl.querySelector('#fsClose') : null;
  const fullscreenBtnEl = document.getElementById('fullscreenBtn');

  // pomocniczne: znajdź wszystkie oryginalne markery (na mapie)
  function getAllMarkers() {
    return Array.from(document.querySelectorAll('.map-marker'));
  }

  // tworzy klon markera do fullscreen
  function createFsClone(orig) {
    const clone = orig.cloneNode(true);
    clone.classList.add('fs-marker');
    clone.removeAttribute('id');
    clone.onclick = null;
    return clone;
  }

  // oblicza opacity wg aktualnego widoku i poziomu markera
  function computeOpacityFor(orig, currentViewLocal, currentFloorLocal) {
    if (currentFloorLocal === '4') return '1';
    const level = orig.dataset.level;
    if (currentViewLocal === 'top') return (level === 'down') ? '0.15' : '1';
    if (currentViewLocal === 'bottom') return (level === 'up') ? '0.15' : '1';
    return '1';
  }

  // wypełnia kontener fullscreen klonami widocznych markerów
  function populateFsMarkers(currentViewLocal, currentFloorLocal) {
    if (!fsMarkersContainer || !fullscreenEl) return;
    fsMarkersContainer.innerHTML = '';

    const visibleMarkers = getAllMarkers().filter(m => m.classList.contains('active'));
    if (!visibleMarkers.length) return;

    // kontener mapy – tu siedzą markery i obrazy
    const mapLayer = document.querySelector('.map-layer');
    if (!mapLayer) return;
    const mapRect = mapLayer.getBoundingClientRect();

    // kontener fullscreen, względem którego pozycjonujemy klony
    const fsContent = fullscreenEl.querySelector('.fullscreen-content');
    if (!fsContent) return;
    const fsRect = fsContent.getBoundingClientRect();

    visibleMarkers.forEach(orig => {
      const clone = createFsClone(orig);

      // pozycja środka oryginalnego markera na mapie
      const oRect = orig.getBoundingClientRect();
      const centerX = oRect.left + oRect.width / 2;
      const centerY = oRect.top + oRect.height / 2;

      // pozycja względna 0–1 w map-layer
      const relX = (centerX - mapRect.left) / mapRect.width;
      const relY = (centerY - mapRect.top) / mapRect.height;

      // pozycja w fullscreen jako % kontenera fullscreen
      clone.style.left = (relX * 100) + '%';
      clone.style.top  = (relY * 100) + '%';
      clone.style.transform = 'translate(-50%, -50%)';

      // opacity wg widoku
      clone.style.opacity = computeOpacityFor(orig, currentViewLocal, currentFloorLocal);

      // pulse tylko jako fs-pulse
      clone.classList.remove('pulse');
      if (orig.classList.contains('pulse')) {
        clone.classList.add('fs-pulse');
      }

      // zachowaj data-* atrybuty
      clone.dataset.point = orig.dataset.point;
      clone.dataset.floor = orig.dataset.floor;
      clone.dataset.level = orig.dataset.level;

      // kliknięcie w klon
      clone.addEventListener('click', (e) => {
        e.stopPropagation();
        const point = clone.dataset.point;
        if (!point) return;

        document.querySelectorAll(`.map-marker[data-point="${point}"]`)
          .forEach(m => m.classList.add('pulse'));

        document.querySelectorAll('.legend-item')
          .forEach(li => li.classList.toggle('active', li.dataset.target === point));
      });

      fsMarkersContainer.appendChild(clone);
    });
  }

  // usuwa klony
  function clearFsMarkers() {
    if (!fsMarkersContainer) return;
    fsMarkersContainer.innerHTML = '';
  }

  // odświeża opacity klonów (np. po zmianie currentView)
  function refreshFsMarkerOpacity(currentViewLocal, currentFloorLocal) {
    if (!fsMarkersContainer) return;
    fsMarkersContainer.querySelectorAll('.fs-marker').forEach(clone => {
      const orig = document.querySelector(`.map-marker[data-point="${clone.dataset.point}"][data-floor="${clone.dataset.floor}"]`);
      if (orig) clone.style.opacity = computeOpacityFor(orig, currentViewLocal, currentFloorLocal);
    });
  }

  // BEZPIECZNE otwieranie fullscreen
  if (fullscreenBtnEl && fullscreenEl) {
    fullscreenBtnEl.addEventListener('click', () => {
      const l = (typeof layers !== 'undefined' && layers[currentFloor]) ? layers[currentFloor] : null;
      if (!l) return;

      try {
        if (currentFloor === "4") {
          const single = el(l.single);
          if (single && fsImg1) fsImg1.src = single.src;
          if (fsImg1) fsImg1.style.opacity = "1";
          if (fsImg2) { fsImg2.style.display = "none"; fsImg2.style.opacity = "1"; }
        } else {
          const g = el(l.g);
          const d = el(l.d);
          if (g && fsImg1) fsImg1.src = g.src;
          if (d && fsImg2) fsImg2.src = d.src;
          if (fsImg2) fsImg2.style.display = "block";

          if (currentView === "top") {
            if (fsImg1) fsImg1.style.opacity = "1";
            if (fsImg2) fsImg2.style.opacity = "0.3";
          } else if (currentView === "bottom") {
            if (fsImg1) fsImg1.style.opacity = "0.3";
            if (fsImg2) fsImg2.style.opacity = "1";
          } else {
            if (fsImg1) fsImg1.style.opacity = "1";
            if (fsImg2) fsImg2.style.opacity = "1";
          }
        }
      } catch (err) {
        console.warn('Błąd ustawiania obrazów fullscreen:', err);
      }

      fullscreenEl.style.display = 'flex';
      requestAnimationFrame(() => fullscreenEl.classList.add('show'));

      requestAnimationFrame(() => populateFsMarkers(currentView, currentFloor));
    });
  }

  // zamykanie przez kliknięcie tła
  if (fullscreenEl) {
    fullscreenEl.addEventListener('click', (e) => {
      if (e.target === fullscreenEl) {
        fullscreenEl.classList.remove('show');
        setTimeout(() => {
          fullscreenEl.style.display = 'none';
          clearFsMarkers();
        }, 200);
      }
    });
  }

  // zamykanie przez przycisk
  if (fsCloseBtn) {
    fsCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fullscreenEl.classList.remove('show');
      setTimeout(() => {
        fullscreenEl.style.display = 'none';
        clearFsMarkers();
      }, 200);
    });
  }

  const floorButtons = document.querySelectorAll('.pietra-item, .pietraa-item');
  const viewButtons = document.querySelectorAll('.goradol-item');

  function maybeRefreshFs() {
    if (!fullscreenEl || !fullscreenEl.classList.contains('show')) return;
    populateFsMarkers(currentView, currentFloor);
  }

  floorButtons.forEach(btn => btn.addEventListener('click', () => {
    setTimeout(maybeRefreshFs, 50);
  }));

  viewButtons.forEach(btn => btn.addEventListener('click', () => {
    setTimeout(maybeRefreshFs, 50);
  }));

  window._fsHelpers = {
    populateFsMarkers,
    clearFsMarkers,
    refreshFsMarkerOpacity
  };
})();





    function el(sel) {
        return document.querySelector(sel);
    }

    let currentFloor = "1";
    let currentView = "both";

    // =========================
    // Zmienia widoczność warstw mapy (pięter i góra/dół) poprzez ustawianie opacity odpowiednich obrazów zależnie od wybranego piętra i trybu widoku.
    // =========================

function updateView() {

    // ukryj WSZYSTKIE obrazy
    Object.values(layers).forEach(l => {
        if (l.g) el(l.g).style.opacity = "0";
        if (l.d) el(l.d).style.opacity = "0";
        if (l.single) el(l.single).style.opacity = "0";
    });

    const l = layers[currentFloor];
    if (!l) return;

    // 🔥 piętro 1 i 4 mają tylko jeden obraz
    if (l.single) {
        el(l.single).style.opacity = "1";
        return;
    }

    // 🔥 piętra 2 i 3 mają dwa widoki
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

        // aktywacja przycisków widoku
        viewItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        currentView = item.dataset.view;

        // zmiana obrazów
        updateView(currentFloor, currentView);

        // 🔥 1. RESET inline stylów markerów (usuwa duchy)
        markers.forEach(m => {
            m.style.opacity = "";
            m.style.transform = "";
        });

        // 🔥 2. ustawienie markerów piętra (czyści active i pokazuje tylko właściwe)
        updateMarkers(currentFloor);

        // 🔥 3. logika GÓRA/DÓŁ tylko dla markerów aktualnego piętra
        markers.forEach(m => {
            if (m.dataset.floor !== currentFloor) return;

            const level = m.dataset.level;

            if (currentView === "top") {
                m.style.opacity = (level === "down") ? "0.35" : "1";
            } 
            else if (currentView === "bottom") {
                m.style.opacity = (level === "up") ? "0.35" : "1";
            } 
            else {
                m.style.opacity = "1";
            }
        });
    });
});







// =========================
// Blokada przycisków na skarbcu
// =========================

function toggleViewButtons(floor) {

    viewItems.forEach(btn => {

        // 🔥 piętro 1 i 4 mają tylko jeden widok → blokujemy GÓRA/DÓŁ
        if (floor === "1" || floor === "4") {
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

    // 🔥 1. RESET inline stylów markerów
    markers.forEach(m => {
        m.style.opacity = "";
        m.style.transform = "";
    });

    // 🔥 2. ukryj wszystkie markery
    markers.forEach(m => m.classList.remove("active"));

    // 🔥 3. pokaż tylko markery z aktualnego piętra
    markers.forEach(m => {
        if (m.dataset.floor === floor) {
            m.classList.add("active");
        }
    });
}

function updateLegend(floor) {

    // pojedyncze elementy
    legendItems.forEach(item => {
        item.style.display = item.dataset.floor === floor ? "block" : "none";
    });

    // całe grupy
    const legendGroups = document.querySelectorAll(".legend-group2");

    legendGroups.forEach(group => {
        group.style.display = group.dataset.floor === floor ? "flex" : "none";
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

        const targetMarkers = document.querySelectorAll(
            `.map-marker[data-point="${targetPoint}"]`
        );

        targetMarkers.forEach(marker => {
            marker.classList.add("pulse");
        });

    });
});

    // =========================
    // Otwieranie i zamykanie fullscreen mapy + ustawianie obrazów (góra/dół albo skarbiec) z odpowiednią przezroczystością.
    // =========================

fullscreenBtn.addEventListener("click", () => {

    const l = layers[currentFloor];

    if (currentFloor === "4") {

        fsImg1.src = el(l.single).src;

        fsImg1.style.opacity = "1"; // 🔥 FIX
        fsImg2.style.display = "none";
        fsImg2.style.opacity = "1"; // 🔥 reset

    } else {

        fsImg1.src = el(l.g).src;
        fsImg2.src = el(l.d).src;

        fsImg2.style.display = "block";

        if (currentView === "top") {
            fsImg1.style.opacity = "1";
            fsImg2.style.opacity = "0.15";

        } else if (currentView === "bottom") {
            fsImg1.style.opacity = "0.15";
            fsImg2.style.opacity = "1";

        } else {
            fsImg1.style.opacity = "1";
            fsImg2.style.opacity = "1";
        }
    }

    fullscreen.style.display = "flex";
    requestAnimationFrame(() => fullscreen.classList.add("show"));
});

fullscreen.addEventListener("click", (e) => {
    if (e.target === fullscreen) {
        fullscreen.classList.remove("show");
        setTimeout(() => fullscreen.style.display = "none", 200);
    }
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



function getNextResetDate(dayTarget, hourTarget) {
    const now = new Date();

    const nowPL = new Date(
        now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" })
    );

    const currentDay = nowPL.getDay();

    let daysToTarget = (dayTarget - currentDay + 7) % 7;

    const nextReset = new Date(nowPL);
    nextReset.setDate(nowPL.getDate() + daysToTarget);
    nextReset.setHours(hourTarget, 0, 0, 0);

    if (daysToTarget === 0 && nowPL >= nextReset) {
        nextReset.setDate(nextReset.getDate() + 7);
    }

    return nextReset;
}

function updateCountdown() {
    const elements = document.querySelectorAll(".reset-timer");

    elements.forEach(el => {

        const dayAttr = el.dataset.day;
        const hour = parseInt(el.dataset.hour) || 0;

        const now = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Europe/Warsaw" })
        );

        let target;

        if (dayAttr !== undefined) {
            const day = parseInt(dayAttr) || 1;
            target = getNextResetDate(day, hour);
        } else {
            target = new Date(now);
            target.setHours(hour, 0, 0, 0);

            if (target <= now) {
                target.setDate(target.getDate() + 1);
            }
        }

        // 🔥 OPCJA: RESET CO 2 TYGODNIE
        const every = el.dataset.every;

        if (every === "2w") {
            const oneJan = new Date(target.getFullYear(), 0, 1);
            const numberOfDays = Math.floor((target - oneJan) / (24 * 60 * 60 * 1000));
            const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);

            if (weekNumber % 2 !== 0) {
                target.setDate(target.getDate() + 7);
            }
        }

        const diff = target - now;

        if (diff <= 0) {
            el.textContent = "Reset teraz!";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);

        if (dayAttr === undefined) {
            el.textContent = `${hours}h ${minutes}m`;
        } else {
            el.textContent = `${days}d ${hours}h ${minutes}m`;
        }
    });
}

updateCountdown();
setInterval(updateCountdown, 60000);

// =========================
// 
// =========================

// ==========================================
//   FULLSCREEN – KONFIGURACJA
// ==========================================

const fsEl = document.getElementById("fullscreen");
const fsImg1 = fsEl.querySelector(".fs-img1");
const fsImg2 = fsEl.querySelector(".fs-img2");
const fsMarkers = fsEl.querySelector(".fs-markers");
const fsClose = document.getElementById("fsClose");

let fsFloor = "1";
let fsView = "both";


// ==========================================
//   USTAWIANIE OBRAZÓW W FULLSCREEN
// ==========================================

function fsUpdateImages() {

    // 🔥 PIĘTRO 1 I 4 → JEDEN OBRAZ
    if (fsFloor === "1" || fsFloor === "4") {

        // pobierz obraz z mapy głównej
        const singleImg = document.querySelector(`.img-${fsFloor}`);

        fsImg1.src = singleImg.src;
        fsImg1.style.opacity = "1";

        // ukryj drugi obraz fullscreen
        fsImg2.style.display = "none";
        fsImg2.style.opacity = "0";

        return;
    }

    // 🔥 PIĘTRA 2 I 3 → DWA OBRAZY
    fsImg1.src = document.querySelector(`.img-${fsFloor}g`).src;
    fsImg2.src = document.querySelector(`.img-${fsFloor}d`).src;

    fsImg2.style.display = "block";

    if (fsView === "top") {
        fsImg1.style.opacity = "1";
        fsImg2.style.opacity = "0.15";
    } else if (fsView === "bottom") {
        fsImg1.style.opacity = "0.15";
        fsImg2.style.opacity = "1";
    } else {
        fsImg1.style.opacity = "1";
        fsImg2.style.opacity = "1";
    }
}



// ==========================================
//   KOPIOWANIE MARKERÓW DO FULLSCREEN
// ==========================================

function fsUpdateMarkers() {

    fsMarkers.innerHTML = "";

    const mapLayer = document.querySelector(".map-layer");
    const mapRect = mapLayer.getBoundingClientRect();

    document.querySelectorAll(".map-marker").forEach(orig => {

        if (orig.dataset.floor !== fsFloor) return;

        const clone = orig.cloneNode(true);
        clone.classList.add("fs-marker");

        const r = orig.getBoundingClientRect();
        const cx = (r.left + r.width/2  - mapRect.left) / mapRect.width  * 100;
        const cy = (r.top  + r.height/2 - mapRect.top ) / mapRect.height * 100;

        clone.style.left = cx + "%";
        clone.style.top  = cy + "%";
        clone.style.transform = "translate(-50%, -50%)";

        if (fsFloor === "4") {
            clone.style.opacity = "1";
        } else if (fsView === "top") {
            clone.style.opacity = (orig.dataset.level === "down") ? "0.15" : "1";
        } else if (fsView === "bottom") {
            clone.style.opacity = (orig.dataset.level === "up") ? "0.15" : "1";
        } else {
            clone.style.opacity = "1";
        }

        fsMarkers.appendChild(clone);
    });
}


// ==========================================
//   ZMIANA PIĘTRA W FULLSCREEN
// ==========================================

function fsSetFloor(floor) {
    fsFloor = floor;

    document.querySelectorAll("#fullscreen .fs-pietra-item")
        .forEach(b => b.classList.toggle("active", b.dataset.floor === floor));

    fsUpdateImages();
    fsUpdateMarkers();
    fsToggleViewButtons(fsFloor);

}


// ==========================================
//   ZMIANA WIDOKU W FULLSCREEN
// ==========================================

function fsSetView(view) {
    fsView = view;

    document.querySelectorAll("#fullscreen .fs-goradol-item")
        .forEach(b => b.classList.toggle("active", b.dataset.view === view));

    fsUpdateImages();
    fsUpdateMarkers();
}


// ==========================================
//   PODPINANIE PRZYCISKÓW FULLSCREEN
// ==========================================

document.querySelectorAll("#fullscreen .fs-pietra-item").forEach(btn => {
    btn.addEventListener("click", e => {
        e.stopPropagation();
        fsSetFloor(btn.dataset.floor);
    });
});

document.querySelectorAll("#fullscreen .fs-goradol-item").forEach(btn => {
    btn.addEventListener("click", e => {
        e.stopPropagation();
        fsSetView(btn.dataset.view);
    });
});


// ==========================================
//   OTWIERANIE FULLSCREEN
// ==========================================

fullscreenBtn.addEventListener("click", () => {




    fsSetFloor(fsFloor);
    fsSetView(fsView);
    fsToggleViewButtons(fsFloor);

    fsEl.style.display = "flex";
    requestAnimationFrame(() => fsEl.classList.add("show"));
});


// ==========================================
//   ZAMYKANIE FULLSCREEN
// ==========================================

fsClose.addEventListener("click", e => {
    e.stopPropagation();
    fsEl.classList.remove("show");
    setTimeout(() => fsEl.style.display = "none", 200);
});

fsEl.addEventListener("click", e => {
    if (e.target === fsEl) {
        fsEl.classList.remove("show");
        setTimeout(() => fsEl.style.display = "none", 200);
    }
});


function fsToggleViewButtons(floor) {
    const btns = document.querySelectorAll("#fullscreen .fs-goradol-item");

    btns.forEach(btn => {
        if (floor === "1" || floor === "4") {
            btn.style.opacity = "0.3";
            btn.style.pointerEvents = "none";
        } else {
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
        }
    });
}
