document.addEventListener('DOMContentLoaded', () => {
    console.log("System: Initializing Code Society Modules...");

    // =================================================================
    // 🔊 AUDIO SYSTEM (COMPLET ACTUALIZAT)
    // =================================================================

    // 1. Definim toate sunetele (inclusiv cele noi pentru TV)
    const sounds = {
        hover: new Audio('assets/audio/hover.mp3'),
        click: new Audio('assets/audio/click.mp3'),
        key: new Audio('assets/audio/key.mp3'),
        success: new Audio('assets/audio/success.mp3'),
        tvOn: new Audio('assets/audio/tv-on.mp3'),      // <--- NOU
        scrollTick: new Audio('assets/audio/scroll.mp3')    // <--- NOU
    };

    // 2. Setăm volumele
    sounds.hover.volume = 0.2;
    sounds.click.volume = 0.4;
    sounds.key.volume = 0.3;
    sounds.success.volume = 0.5;

    // Configurare specială pentru TV
    if (sounds.tvOn) sounds.tvOn.volume = 0.2;

    if (sounds.scrollTick) {
        sounds.scrollTick.volume = 0.3;
    }

    // 3. Funcția principală de redare (O înlocuiește pe cea veche)
    const playSound = (soundName) => {
        const audio = sounds[soundName];
        if (audio) {
            try {
                // CAZ SPECIAL: TASTARE (Vrem să se suprapună rapid sunetele)
                if (soundName === 'key') {
                    const clone = audio.cloneNode();
                    clone.volume = audio.volume;
                    clone.play().catch(() => { });
                }
                // CAZ SPECIAL: STATIC (Nu facem nimic aici, îl controlăm manual la scroll)
                else if (soundName === 'static') {
                    // Ignorăm playSound('static') standard, pentru că folosim play() și pause() direct în evenimentul de scroll
                }
                // CAZ STANDARD: Orice alt sunet (Hover, Click, Success, TvOn)
                // Le resetăm la 0 și le dăm play
                else {
                    audio.currentTime = 0;
                    audio.play().catch(() => { });
                }
            } catch (e) {
                console.warn(`Audio '${soundName}' failed:`, e);
            }
        }
    };

    // 1. INTERACȚIUNI UI (Hover & Click)
    // Am adăugat la final: .event-card, .flip-card
    const uiElements = document.querySelectorAll('button, .btn, .terminal-submit, input, textarea, select, .event-card, .flip-card');

    uiElements.forEach(el => {
        el.addEventListener('mouseenter', () => playSound('hover'));
        el.addEventListener('mousedown', () => playSound('click'));
    });

    // 2. NAVIGARE SMART (Sunet + Terminal Transition pentru Join)
    const joinBtn = document.getElementById('joinBtn');
    const overlay = document.getElementById('terminal-overlay') || createOverlay(); // Folosim o funcție de siguranță

    // Funcție de ajutor dacă nu găsește overlay-ul în HTML
    function createOverlay() {
        const div = document.createElement('div');
        div.id = 'terminal-overlay';
        div.style.display = 'none'; // Ascuns inițial
        document.body.appendChild(div);
        return div;
    }

    if (joinBtn) {
        joinBtn.addEventListener('click', function (e) {
            // 1. OPRIM NAVIGAREA IMEDIATĂ
            e.preventDefault();
            console.log("Hacking initiated..."); // Verificăm în consolă

            // 2. Play Click Sound
            if (typeof playSound === 'function') playSound('click');

            // 3. Arătăm Overlay-ul
            overlay.style.display = 'flex';
            overlay.innerHTML = ''; // Curățăm textul vechi

            // 4. Secvența de text
            const bootSequence = [
                `> INITIALIZING UPLINK...`,
                `> BYPASSING FIREWALL [PROXY_22]...`,
                `> AUTHENTICATING USER... <span class="term-highlight">OK</span>`,
                `> ESTABLISHING SECURE CONNECTION...`,
                `> ACCESS GRANTED.`
            ];

            let delay = 0;
            const lineSpeed = 150;

            bootSequence.forEach((line) => {
                setTimeout(() => {
                    const p = document.createElement('div');
                    p.className = 'term-line';
                    p.innerHTML = line;
                    overlay.appendChild(p);

                    // Sunet tastare (dacă există funcția)
                    if (typeof playSound === 'function') playSound('key');

                    overlay.scrollTop = overlay.scrollHeight;
                }, delay);
                delay += lineSpeed;
            });

            // 5. REDIRECȚIONAREA FINALĂ
            setTimeout(() => {
                console.log("Redirecting to join.html...");
                // Folosim window.location.href direct către link-ul din buton
                window.location.href = joinBtn.getAttribute('href');
            }, delay + 500);
        });
    }

    // 3. SUNET TASTARE (Oriunde scrii)
    const inputFields = document.querySelectorAll('input, textarea');
    if (inputFields.length > 0) {
        inputFields.forEach(field => {
            field.addEventListener('keydown', (e) => {
                // Ignorăm tastele 'mute' (Shift, Ctrl, Alt)
                if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
                    playSound('key');
                }
            });
        });
    }

    // =================================================================
    // 🛠️ RESTUL MODULELOR
    // =================================================================

    // --- FORCE SCROLL TO TOP ---
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    } else {
        window.onbeforeunload = function () { window.scrollTo(0, 0); }
    }

    // --- MENIU MOBIL ---
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-links");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
        document.querySelectorAll(".nav-links li a").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }));
    }

    // --- TYPEWRITER EFFECT ---
    const titleElement = document.querySelector('.hero-content h1');
    if (titleElement) {
        const textToType = "BUILDING THE FUTURE BIT BY BIT";
        titleElement.innerHTML = ".";
        let i = 0;
        function typeWriter() {
            if (i < textToType.length) {
                titleElement.innerHTML += textToType.charAt(i);
                i++;
                setTimeout(typeWriter, 75);
            } else {
                titleElement.innerHTML += '<span class="blinking-cursor">_</span>';
            }
        }
        setTimeout(typeWriter, 500);
    }

    // --- SCROLL REVEAL ---
    const reveals = document.querySelectorAll(".reveal");
    if (reveals.length > 0) {
        function reveal() {
            for (var i = 0; i < reveals.length; i++) {
                var windowHeight = window.innerHeight;
                var elementTop = reveals[i].getBoundingClientRect().top;
                var elementVisible = 30;
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add("active");
                } else {
                    reveals[i].classList.remove("active");
                }
            }
        }
        window.addEventListener("scroll", reveal);
        reveal();
    }

    // --- PRELOADER ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', function () {
            setTimeout(function () {
                preloader.classList.add('preloader-hidden');
            }, 2200);
        });
    }

    // --- ANIMATED COUNTERS ---
    const counters = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.stats-row');
    if (statsSection && counters.length > 0) {
        let hasCounted = false;
        function startCounting() {
            const sectionPos = statsSection.getBoundingClientRect().top;
            const screenPos = window.innerHeight / 1.3;
            if (sectionPos < screenPos && !hasCounted) {
                hasCounted = true;
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const speed = 200;
                    const updateCount = () => {
                        const count = +counter.innerText;
                        const increment = target / speed;
                        if (count < target) {
                            counter.innerText = Math.ceil(count + increment);
                            setTimeout(updateCount, 20);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                });
            }
        }
        window.addEventListener('scroll', startCounting);
    }

    // --- BACK TO TOP ---
    const toTopBtn = document.getElementById("backToTop");
    if (toTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) toTopBtn.classList.add("show");
            else toTopBtn.classList.remove("show");
        });
        toTopBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // --- 8. SCROLL SPY (FIXED & PRECISE) ---
    // Definim variabilele din nou local pentru a evita conflicte
    const spySections = document.querySelectorAll('section');
    const navSpyLinks = document.querySelectorAll('.nav-links a');

    if (spySections.length > 0 && navSpyLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let currentSection = '';

            // Offset pentru bara de meniu (ca să se activeze puțin înainte să ajungă titlul sus)
            const navHeight = 100;

            spySections.forEach(section => {
                const sectionTop = section.offsetTop - navHeight;
                const sectionHeight = section.offsetHeight;

                // VERIFICARE STRICTĂ: Suntem între începutul și sfârșitul secțiunii?
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });

            // Dacă suntem la fundul paginii, forțăm activarea ultimului link (Parteneri/Contact)
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                // Găsim ultimul ID din pagină
                const lastSection = spySections[spySections.length - 1];
                if (lastSection) currentSection = lastSection.getAttribute('id');
            }

            navSpyLinks.forEach(link => {
                link.classList.remove('active-link');
                const href = link.getAttribute('href');
                // Verificăm dacă link-ul conține ID-ul curent
                if (currentSection && href.includes(currentSection)) {
                    link.classList.add('active-link');
                }
            });
        });
    }

    // --- MAGNETIC BUTTONS ---
    const magneticBtns = document.querySelectorAll('.btn, .nav-btn-cta');
    if (magneticBtns.length > 0) {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', function (e) {
                const position = btn.getBoundingClientRect();
                const x = e.clientX - position.left - position.width / 2;
                const y = e.clientY - position.top - position.height / 2;
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
            });
            btn.addEventListener('mouseout', function () {
                btn.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    // --- PARALLAX HERO ---
    const heroSection = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    if (heroSection && heroContent) {
        heroSection.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            heroContent.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
        heroSection.addEventListener('mouseleave', () => {
            heroContent.style.transform = `translateX(0) translateY(0)`;
        });
    }

    // --- KONAMI CODE (MATRIX MODE ADVANCED) ---
    const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let sequence = [];

    window.addEventListener('keydown', (e) => {
        sequence.push(e.key);

        // Păstrăm doar ultimele taste apăsate, cât lungimea codului
        if (sequence.length > secretCode.length) {
            sequence.shift();
        }

        // Verificăm dacă secvența corespunde
        if (JSON.stringify(sequence) === JSON.stringify(secretCode)) {
            activateMatrixMode();
            // Resetăm secvența ca să nu se declanșeze de mai multe ori
            sequence = [];
        }
    });

    function activateMatrixMode() {
        console.log("SYSTEM HACKED: MATRIX MODE ENGAGED");
        alert("SYSTEM HACKED! WELCOME TO THE MATRIX.");

        // 1. Activăm clasa CSS care schimbă toate culorile în VERDE
        document.body.classList.add('matrix-mode');

        // 2. Schimbăm LOGO-ul
        const logo = document.getElementById('mainLogo');
        if (logo) {
            // Asigură-te că ai imaginea asta în folder!
            logo.src = 'assets/img/logo-verde.png';
        }

        // 3. Schimbăm VIDEO-ul de fundal
        const video = document.getElementById('bgVideo');
        if (video) {
            // Asigură-te că ai videoul asta în folder!
            video.src = 'assets/video/matrix.mp4';
            video.load(); // Reîncarcă sursa
            video.play();
        }

        // 4. Schimbăm Textul din Marquee (Banda rulantă)
        const marqueeText = document.querySelector('.marquee-content');
        if (marqueeText) {
            marqueeText.innerHTML = "SYSTEM COMPROMISED /// WELCOME TO THE REAL WORLD /// FOLLOW THE WHITE RABBIT /// ";
        }

        // 5. Redăm un sunet specific (Opțional, dacă ai fișierul)
        // const matrixSound = new Audio('assets/audio/matrix-intro.mp3');
        // matrixSound.play();
    }

    // --- TERMINAL FORM SUBMISSION ---
    const hackerForm = document.getElementById('hackerForm');
    const terminalBody = document.querySelector('.terminal-body');

    if (hackerForm && terminalBody) {
        console.log("System: Join Protocol Initiated.");
        const nameInput = document.getElementById("name");
        if (nameInput) setTimeout(() => nameInput.focus(), 1000);

        hackerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Redăm sunetul de succes aici
            // (Se va auzi imediat ce dai submit pentru feedback instant)
            // Dacă vrei doar la final, mută linia asta în blocul 'if (response.ok)' de mai jos
            // playSound('click'); 

            const data = new FormData(hackerForm);
            const nameVal = document.getElementById('name').value;
            const roleVal = document.getElementById('role').value;

            terminalBody.innerHTML = '';
            const scanline = document.createElement('div');
            scanline.className = 'scanline';
            terminalBody.appendChild(scanline);

            function printLog(htmlText) {
                const p = document.createElement('p');
                p.className = 'output';
                p.innerHTML = htmlText;
                terminalBody.appendChild(p);
                terminalBody.scrollTop = terminalBody.scrollHeight;
                // Sunet subtil la fiecare linie de log
                playSound('key');
            }

            const logs = [
                `> Establishing secure handshake...`,
                `> Target: <span style="color:var(--red-primary)">${nameVal}</span>`,
                `> Class: [${roleVal.toUpperCase()}]`,
                `> Encrypting packets (AES-256)...`,
                `> Uploading to server...`
            ];

            let delay = 0;
            logs.forEach((msg) => {
                delay += 400;
                setTimeout(() => printLog(msg), delay);
            });

            setTimeout(() => {
                fetch(hackerForm.action, {
                    method: hackerForm.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                })
                    .then(response => {
                        if (response.ok) {
                            // 🟢 AICI SE AUDE SUNETUL DE SUCCES
                            playSound('success');

                            printLog(`<br>`);
                            printLog(`<span style="color:#27c93f; font-weight:bold;">[SUCCESS] TRANSMISSION COMPLETE.</span>`);
                            printLog(`> Welcome to the system.`);
                            printLog(`> Check your email.`);

                            setTimeout(() => {
                                const btn = document.createElement('a');
                                btn.href = 'index.html';
                                btn.className = 'terminal-submit';
                                btn.style.textAlign = 'center';
                                btn.style.textDecoration = 'none';
                                btn.style.marginTop = '20px';
                                btn.innerHTML = '< RETURN_HOME';
                                terminalBody.appendChild(btn);
                                terminalBody.scrollTop = terminalBody.scrollHeight;
                            }, 1000);
                            hackerForm.reset();
                        } else {
                            printLog(`<span style="color:red;">[ERROR] Server rejected connection.</span>`);
                        }
                    })
                    .catch(error => {
                        printLog(`<span style="color:red;">[CRITICAL] Network unavailable.</span>`);
                    });
            }, delay + 500);
        });
    }

    // --- 18. HORIZONTAL SCROLL + TACTILE CLICKS ---
    const stickySection = document.querySelector('.horizontal-scroll-section');
    const track = document.querySelector('.horizontal-track');
    const tvScreen = document.getElementById('tvScreen');
    const tvHeader = document.querySelector('.sponsors-header');

    // A. LOGICA TV ON (Rămâne neschimbată)
    if (tvScreen && tvHeader) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!tvScreen.classList.contains('tv-active')) {
                        tvScreen.classList.add('tv-active');
                        playSound('tvOn'); // Sunetul de deschidere
                    }
                } else {
                    tvScreen.classList.remove('tv-active');
                }
            });
        }, { threshold: 0.1 });
        observer.observe(tvHeader);
    }

    // B. LOGICA SCROLL "CLICKY"
    if (stickySection && track && window.innerWidth > 768) {

        // Variabilă pentru a ține minte unde am făcut ultimul click
        let lastSoundPosition = 0;
        // Distanța (în pixeli) dintre click-uri. 
        // Micșorează la 30 pentru click-uri mai dese, mărește la 100 pentru mai rare.
        const clickDistance = 50;

        window.addEventListener('scroll', () => {
            const offsetTop = stickySection.parentElement.offsetTop;
            const sectionTop = stickySection.getBoundingClientRect().top;
            const sectionHeight = stickySection.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollDistance = sectionHeight - windowHeight;
            const trackWidth = track.scrollWidth - window.innerWidth + 200;

            const isInTvSection = (sectionTop <= 0 && -sectionTop < scrollDistance);

            if (isInTvSection) {
                // 1. Calculăm mișcarea
                const progress = Math.abs(sectionTop) / scrollDistance;
                const moveX = progress * trackWidth;

                track.style.transform = `translateX(-${moveX}px)`;

                // 2. SUNET TACTIL (Logică bazată pe distanță)
                // Verificăm dacă diferența dintre poziția curentă (moveX) și ultima poziție (lastSoundPosition) e mai mare decât pasul
                if (Math.abs(moveX - lastSoundPosition) > clickDistance) {

                    // Redăm sunetul!
                    if (sounds.scrollTick) {
                        // Clonăm sunetul ca să se poată suprapune rapid dacă dai scroll tare
                        const clone = sounds.scrollTick.cloneNode();
                        clone.volume = 0.2; // Volum discret

                        // TRUC PRO: Variem puțin pitch-ul (viteza) pentru a suna organic, nu robotic
                        // Valoare între 0.9 (mai gros) și 1.1 (mai subțire)
                        clone.playbackRate = 0.9 + Math.random() * 0.2;

                        clone.play().catch(() => { });
                    }

                    // Actualizăm poziția ultimului click
                    lastSoundPosition = moveX;
                }
            }
            else {
                // Resetare poziții când ieșim
                if (-sectionTop >= scrollDistance) {
                    track.style.transform = `translateX(-${trackWidth}px)`;
                }
                else if (sectionTop > 0) {
                    track.style.transform = `translateX(0px)`;
                }
            }
        });
    }
});