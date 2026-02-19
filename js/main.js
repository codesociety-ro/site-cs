(function() {
    "use strict"; // Activează modul strict - interzice variabilele nedeclarate și alte vulnerabilități

    // Logica pentru a ascunde preloader-ul imediat (deoarece am șters-o din HTML)
    if (sessionStorage.getItem('preloaderShown') === 'true') {
        const tempStyle = document.createElement('style');
        tempStyle.innerHTML = '#preloader { display: none !important; }';
        document.head.appendChild(tempStyle);
    }

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
                    
                    // 🔧 FIX MEMORY LEAK: Distrugem clona după ce se termină sunetul
                    clone.onended = function() {
                        clone.remove(); 
                    };
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

// =================================================================
    // 🚀 2. NAVIGARE SMART (Sunet + Terminal Transition) - FIX SUPREM
    // =================================================================
    
    // Căutăm toate butoanele care conțin 'join' în link (acoperă și localhost și Netlify)
    const joinLinks = document.querySelectorAll('a[href*="join"]'); 
    
    // Funcție sigură care caută ecranul negru sau îl creează dacă nu există
    function getOrCreateOverlay() {
        let div = document.getElementById('terminal-overlay');
        if (!div) {
            div = document.createElement('div');
            div.id = 'terminal-overlay';
            document.body.appendChild(div);
        }
        div.style.display = 'none'; 
        return div;
    }

    const overlay = getOrCreateOverlay();

    if (joinLinks.length > 0) {
        joinLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                
                // 1. Ignorăm ancorele (#)
                const targetAttr = this.getAttribute('href');
                if (!targetAttr || targetAttr.startsWith('#')) return;

                // 2. PROTECȚIE: Verificăm URL-ul curent. 
                // Dacă suntem DEJA pe pagina de join, lăsăm browserul să facă scroll normal, nu repetăm animația
                const currentUrl = window.location.href.toLowerCase();
                if (currentUrl.includes('join.html') || currentUrl.endsWith('/join') || currentUrl.endsWith('/join/')) {
                    return; 
                }

                // 3. START ANIMAȚIE (Oprim trecerea instantanee pe altă pagină)
                e.preventDefault(); 
                console.log("Terminal Booting..."); 

                // Preluăm link-ul complet (ex: join.html?event=AI)
                const fullUrl = this.href; 

                // Play sunet click
                if (typeof playSound === 'function') playSound('click');

                // Arătăm ecranul de loading
                overlay.style.display = 'flex';
                overlay.innerHTML = ''; 

                const bootSequence = [
                    `> INITIATING SECURE UPLINK...`,
                    `> BYPASSING FIREWALL [PROXY_22]...`,
                    `> AUTHENTICATING USER... <span style="color: #27c93f; font-weight: bold;">OK</span>`,
                    `> ESTABLISHING CONNECTION...`,
                    `> SYSTEM ACCESS GRANTED.`
                ];

                let delay = 0;
                const lineSpeed = 150; // ms între linii

                // Scriem liniile ca un hacker
                bootSequence.forEach((line) => {
                    setTimeout(() => {
                        const p = document.createElement('div');
                        p.className = 'term-line';
                        p.innerHTML = line;
                        overlay.appendChild(p);

                        if (typeof playSound === 'function') playSound('key');

                        // Scroll automat în jos
                        overlay.scrollTop = overlay.scrollHeight;
                    }, delay);
                    delay += lineSpeed;
                });

                // 4. REDIRECȚIONAREA (După ce s-au scris toate liniile)
                setTimeout(() => {
                    window.location.href = fullUrl;
                }, delay + 400); // 400ms timp să citească "ACCESS GRANTED"
            });
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

// --- TYPEWRITER EFFECT (ONCE PER SESSION) ---
    const titleElement = document.querySelector('.hero-content h1');
    if (titleElement) {
        const textToType = "BUILDING THE FUTURE BIT BY BIT";
        
        // Verificăm dacă a văzut deja animația
        if (sessionStorage.getItem('typewriterShown') === 'true') {
            // Dacă a văzut-o, scriem tot textul instantaneu (inclusiv punctul inițial și cursorul)
            titleElement.innerHTML = "." + textToType + '<span class="blinking-cursor">_</span>';
        } else {
            // Dacă e prima dată, pornim animația literă cu literă
            titleElement.innerHTML = ".";
            let i = 0;
            function typeWriter() {
                if (i < textToType.length) {
                    titleElement.innerHTML += textToType.charAt(i);
                    i++;
                    setTimeout(typeWriter, 75); // Viteza de scriere
                } else {
                    titleElement.innerHTML += '<span class="blinking-cursor">_</span>';
                    
                    // După ce termină de scris, salvăm în memorie ca să nu o mai repete
                    sessionStorage.setItem('typewriterShown', 'true');
                }
            }
            // Începem animația după 500ms
            setTimeout(typeWriter, 500);
        }
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

 // --- PRELOADER (ONCE PER SESSION) ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Verificăm dacă utilizatorul a mai văzut loader-ul în sesiunea curentă
        if (sessionStorage.getItem('preloaderShown') === 'true') {
            // Dacă L-A VĂZUT deja, îl ascundem instantaneu, fără animație
            preloader.style.display = 'none';
        } else {
            // Dacă NU L-A VĂZUT (prima vizită), rulăm animația normală
            window.addEventListener('load', function () {
                setTimeout(function () {
                    preloader.classList.add('preloader-hidden');
                    
                    // Salvăm în memorie faptul că l-a văzut
                    sessionStorage.setItem('preloaderShown', 'true');
                    
                    // Opțional: Ștergem complet din HTML după ce se ascunde, pentru performanță
                    setTimeout(() => { preloader.style.display = 'none'; }, 500);
                }, 2200);
            });
        }
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
    const spySections = document.querySelectorAll('section');
    const navSpyLinks = document.querySelectorAll('.nav-links a');
    
    // VERIFICARE: Suntem pe pagina principală (index.html)? 
    // (Știm asta pentru că doar acolo există secțiunea cu id="home")
    const isHomePage = document.getElementById('home'); 

    // Rulăm scroll spy-ul DOAR dacă suntem pe pagina principală
    if (spySections.length > 0 && navSpyLinks.length > 0 && isHomePage) {
        
        function updateScrollSpy() {
            let currentSection = '';
            const navHeight = 100; // Offset pentru meniu

            // Dacă suntem sus de tot, forțăm aprinderea butonului "home"
            if (window.scrollY < 50) {
                currentSection = 'home';
            } else {
                spySections.forEach(section => {
                    const sectionTop = section.offsetTop - navHeight;
                    const sectionHeight = section.offsetHeight;

                    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                        currentSection = section.getAttribute('id');
                    }
                });

                // Dacă suntem la fundul paginii
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                    const lastSection = spySections[spySections.length - 1];
                    if (lastSection) currentSection = lastSection.getAttribute('id');
                }
            }

            // Aplicăm culorile pe butoanele din meniu
            navSpyLinks.forEach(link => {
                const href = link.getAttribute('href');
                
                // Modificăm doar link-urile cu ancoră (#)
                if (href.includes('#')) {
                    link.classList.remove('active-link');
                    
                    if (currentSection && href.includes('#' + currentSection)) {
                        link.classList.add('active-link');
                    }
                }
            });
        }

        // Rulăm funcția
        window.addEventListener('scroll', updateScrollSpy);
        window.addEventListener('load', updateScrollSpy);
        updateScrollSpy();
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

// =================================================================
    // 🐇 KONAMI CODE (MATRIX MODE - PERSISTENT ACROSS PAGES)
    // =================================================================
    const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let sequence = [];

    // 1. Funcția silențioasă care schimbă culorile (fără alerte)
    function applyMatrixTheme() {
        document.body.classList.add('matrix-mode');

        // Schimbăm LOGO-ul (căutăm după clasă ca să meargă pe toate paginile)
        const logos = document.querySelectorAll('.logo-img');
        logos.forEach(logo => {
            if (!logo.src.includes('logo-verde.png')) {
                logo.src = 'assets/img/logo-verde.png';
            }
        });

        // Schimbăm VIDEO-ul (doar pe index.html)
        const video = document.getElementById('bgVideo');
        if (video && !video.src.includes('matrix.mp4')) {
            video.src = 'assets/video/matrix.mp4';
            video.load();
            video.play().catch(()=>{});
        }

       // Schimbăm Marquee-ul (doar pe index.html)
        const marqueeTexts = document.querySelectorAll('.marquee-content');
        marqueeTexts.forEach(contentBlock => {
            // Repetăm textul de câteva ori ca să fim siguri că e super lung pe ecrane mari
            contentBlock.innerHTML = "SYSTEM COMPROMISED /// WELCOME TO THE REAL WORLD /// FOLLOW THE WHITE RABBIT /// SYSTEM COMPROMISED /// WELCOME TO THE REAL WORLD /// FOLLOW THE WHITE RABBIT /// ";
        });
    }

    // 2. LA FIECARE ÎNCĂRCARE DE PAGINĂ: Verificăm dacă e deja hackuit
    if (sessionStorage.getItem('matrixMode') === 'true') {
        applyMatrixTheme();
    }

    // 3. Ascultăm tastele pentru activarea inițială
    window.addEventListener('keydown', (e) => {
        sequence.push(e.key);

        if (sequence.length > secretCode.length) {
            sequence.shift();
        }

        if (JSON.stringify(sequence) === JSON.stringify(secretCode)) {
            // Dacă nu e deja activat, îl activăm acum
            if (sessionStorage.getItem('matrixMode') !== 'true') {
                console.log("SYSTEM HACKED: MATRIX MODE ENGAGED");
                alert("SYSTEM HACKED! WELCOME TO THE MATRIX.");
                
                // Salvăm în memorie ca să știe și celelalte pagini
                sessionStorage.setItem('matrixMode', 'true');
                
                // Aplicăm vizualul
                applyMatrixTheme();
            }
            sequence = []; // Resetăm secvența
        }
    });

// --- TERMINAL FORM SUBMISSION (SMART DYNAMIC FORM) ---
    const hackerForm = document.getElementById('hackerForm');
    const terminalBody = document.querySelector('.terminal-body');

    // ========================================================
    // 1. CITIM EVENIMENTUL DIN LINK ȘI AUTO-SELECTĂM ÎN LISTĂ
    // ========================================================
    const eventSelect = document.getElementById('event_select');
    
    if (eventSelect) {
        const urlParams = new URLSearchParams(window.location.search);
        const eventName = urlParams.get('event');
        
        // Dacă a intrat pe formular printr-un click pe "Rezervă loc"
        if (eventName) {
            let optionExists = false;
            
            // Căutăm dacă evenimentul din link există deja în opțiunile noastre
            for (let i = 0; i < eventSelect.options.length; i++) {
                if (eventSelect.options[i].value === eventName) {
                    optionExists = true;
                    break;
                }
            }
            
            // TRUC SMART: Dacă a apăsat pe un eveniment pe care ai uitat să-l pui în HTML-ul select-ului,
            // scriptul creează opțiunea pe loc ca să nu dea eroare!
            if (!optionExists) {
                const newOption = document.createElement('option');
                newOption.value = eventName;
                newOption.text = eventName;
                eventSelect.add(newOption);
            }
            
            // Bifăm automat evenimentul
            eventSelect.value = eventName;
        }
    }

    // ========================================================
    // 2. LOGICA DE SUBMIT (cu Securitate)
    // ========================================================
    if (hackerForm && terminalBody) {
        hackerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // 🛡️ PROTECȚIE ANTI-BOT (HONEYPOT)
            const honeypot = document.getElementById('website_url');
            if (honeypot && honeypot.value !== "") {
                console.warn("SYSTEM DEFENSE: Bot activity detected. Connection terminated.");
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
                return; 
            }

            // 🛡️ SANATIZARE ANTI-XSS
            function sanitizeInput(str) {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            }

            const data = new FormData(hackerForm);
            
            const rawName = document.getElementById('name').value;
            const nameVal = sanitizeInput(rawName);
            data.set('name', nameVal);

            // AICI AM SCHIMBAT: Acum luăm valoarea direct din Select!
            const eventVal = eventSelect ? eventSelect.value : "Unknown";

            // De aici începe animația normală de terminal
            terminalBody.innerHTML = '';
            // ... (restul codului cu scanline, printLog, fetch rămâne neatins)

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
                if (typeof playSound === 'function') playSound('key');
            }

            const logs = [
                `> Establishing secure handshake...`,
                `> Target: <span style="color:var(--red-primary)">${nameVal}</span>`,
                `> Event Route: [${eventVal}]`,
                `> Validating compliance protocols (GDPR)... <span style="color:#27c93f">OK</span>`,
                `> Encrypting packets (AES-256)...`,
                `> Uploading to server...`
            ];

            let delay = 0;
            logs.forEach((msg) => {
                delay += 400;
                setTimeout(() => printLog(msg), delay);
            });

// 🚀 TRIMITEM DATELE LA SERVER
            setTimeout(() => {
                fetch(hackerForm.action, {
                    method: 'POST',
                    mode: 'no-cors', // <--- SOLUȚIA PENTRU EROAREA DE LA GOOGLE
                    body: data
                })
                .then(() => {
                    // Dacă folosim no-cors, presupunem că s-a trimis cu succes către Google
                    if (typeof playSound === 'function') playSound('success');
                    printLog(`<br>`);
                    printLog(`<span style="color:#27c93f; font-weight:bold;">[SUCCESS] REGISTRATION COMPLETE.</span>`);
                    printLog(`> Welcome to the system.`);
                    printLog(`> Check your email for further instructions.`);

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
                    
                    hackerForm.reset(); // Golim formularul după succes
                })
                .catch(error => {
                    console.error("Fetch Error:", error);
                    // Aici ajunge doar dacă pică internetul utilizatorului
                    printLog(`<span style="color:red; font-weight:bold;">[CRITICAL] Network unavailable.</span>`);
                    printLog(`> Fatal error detected. Rerouting...`);
                    setTimeout(() => { window.location.href = '404.html'; }, 1500);
                });
            }, delay + 500);
        });
    }

// =================================================================
    // 📺 18. HORIZONTAL SCROLL + TACTILE CLICKS (TV RĂMÂNE APRINS JOS)
    // =================================================================
    const stickySection = document.querySelector('.horizontal-scroll-section');
    const track = document.querySelector('.horizontal-track');
    const tvScreen = document.querySelector('.tv-screen-container');
    const tvHeader = document.querySelector('.sponsors-header'); 

    // A. LOGICA TV ON / OFF (Smart Logic)
    if (tvScreen && tvHeader) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 1. Am ajuns la TV -> Îl aprindem
                    if (!tvScreen.classList.contains('tv-active')) {
                        tvScreen.classList.add('tv-active');
                        if (typeof playSound === 'function') {
                            playSound('tvOn'); 
                        }
                    }
                } else {
                    // 2. Am ieșit de pe secțiunea TV. 
                    // Verificăm UNDE a plecat utilizatorul:
                    if (entry.boundingClientRect.top > 0) {
                        // Secțiunea a rămas SUB ecran (utilizatorul a dat scroll în SUS spre meniu)
                        // Îl stingem, ca să pornească iar când coboară.
                        tvScreen.classList.remove('tv-active');
                    }
                    // Dacă entry.boundingClientRect.top este < 0, înseamnă că am dat scroll în JOS spre Footer.
                    // Nu scriem nimic, deci televizorul rămâne aprins!
                }
            });
        }, { threshold: 0.1 }); 
        
        observer.observe(tvHeader); 
    }

    // B. LOGICA SCROLL "CLICKY"
    if (stickySection && track && window.innerWidth > 768) {

        let lastSoundPosition = 0;
        const clickDistance = 50;

        window.addEventListener('scroll', () => {
            const sectionTop = stickySection.getBoundingClientRect().top;
            const sectionHeight = stickySection.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollDistance = sectionHeight - windowHeight;
            const trackWidth = track.scrollWidth - window.innerWidth + 200;

            const isInTvSection = (sectionTop <= 0 && -sectionTop < scrollDistance);

            if (isInTvSection) {
                // Calculăm mișcarea cardurilor
                const progress = Math.abs(sectionTop) / scrollDistance;
                const moveX = progress * trackWidth;

                track.style.transform = `translateX(-${moveX}px)`;

                // SUNET TACTIL
                if (Math.abs(moveX - lastSoundPosition) > clickDistance) {
                    if (typeof sounds !== 'undefined' && sounds.scrollTick) {
                        const clone = sounds.scrollTick.cloneNode();
                        clone.volume = 0.2;
                        clone.playbackRate = 0.9 + Math.random() * 0.2;
                        clone.play().catch(() => { });
                    }
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

    // =================================================================
    // 🎟️ EVENT MODAL LOGIC (Pop-up Detalii Evenimente)
    // =================================================================
    const modal = document.getElementById('eventModal');
    const modalBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtn = document.querySelector('.close-modal');

    if (modal && modalBtns.length > 0) {
        // Găsim locurile goale din modal unde vom pune textul
        const mTitle = document.getElementById('modalTitle');
        const mTag = document.getElementById('modalTag');
        const mDate = document.getElementById('modalDate');
        const mLocation = document.getElementById('modalLocation');
        const mDesc = document.getElementById('modalDescription');
        const mImg = document.getElementById('modalImage');

        // Adăugăm funcția de click pe fiecare buton din carduri
        modalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Oprește site-ul să sară brusc sus
                
                // 1. Luăm datele din buton (pe care le-am pus în HTML) și le punem în fereastră
                mTitle.textContent = btn.getAttribute('data-title');
                mTag.textContent = btn.getAttribute('data-tag');
                mDate.innerHTML = `📅 ${btn.getAttribute('data-date')}`;
                mLocation.innerHTML = `📍 ${btn.getAttribute('data-location')}`;
                mDesc.innerHTML = btn.getAttribute('data-desc'); 
                
                // --- COD NOU: MODIFICĂM LINK-UL CĂTRE FORMULAR ---
                const modalJoinBtn = document.querySelector('.modal-footer a');
                if (modalJoinBtn) {
                    // Punem numele evenimentului în link (ex: join.html?event=FUTURE OF AI)
                    const eventName = btn.getAttribute('data-title');
                    modalJoinBtn.href = `join.html?event=${encodeURIComponent(eventName)}`;
                }
                
                // Punem imaginea corectă (dacă există)
                const imgSrc = btn.getAttribute('data-image');
                if (imgSrc && imgSrc !== "") {
                    mImg.src = imgSrc;
                    mImg.style.display = 'block';
                } else {
                    mImg.style.display = 'none'; // Ascundem poza dacă evenimentul nu are poză
                }

                // 2. Afișăm Modalul adăugând clasa 'show'
                modal.classList.add('show');
                
                // 3. Opțional: Sunet de click
                if (typeof playSound === 'function') playSound('click');
            });
        });

        // Funcția de închidere când dăm click pe "X"
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                if (typeof playSound === 'function') playSound('hover');
            });
        }

        // Funcția de închidere când dăm click oriunde în afara ferestrei (pe fundalul întunecat)
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

   // =================================================================
    // 🟢 LIVE FORM VALIDATION & FACULTY RESTRICTION (Terminal Style)
    // =================================================================
    const formInputs = document.querySelectorAll('.terminal-input-group input[type="text"], .terminal-input-group input[type="email"], .terminal-input-group select');
    
    if (formInputs.length > 0) {
        formInputs.forEach(input => {
            const statusIndicator = document.createElement('span');
            statusIndicator.className = 'val-status font-hacked';
            statusIndicator.style.marginLeft = '15px'; 
            statusIndicator.style.fontSize = '0.9rem';
            statusIndicator.style.transition = 'all 0.3s ease';
            
            input.parentElement.appendChild(statusIndicator);

            const checkInput = () => {
                if (input.value.trim() === "") {
                    statusIndicator.innerHTML = ""; 
                    input.setCustomValidity(""); // Resetăm erorile interne
                } else {
                    
                    // ====================================================
                    // 🔒 REGULĂ STRICTĂ DOAR PENTRU CÂMPUL "FACULTATE"
                    // ====================================================
                    if (input.id === 'faculty') {
                        const val = input.value.toLowerCase();
                        
                        // AICI SUNT PRESCURTĂRILE ȘI CUVINTELE ACCEPTATE
                        // Poți adăuga oricâte vrei între ghilimele, separate prin virgulă!
                        const allowedFaculties = [
                            // 💻 BAZA (Tehnic / IT / Matematică - Cele mai probabile)
                            'csie', 'cibernetica', 'acs', 'automatica', 'calculatoare', 'cti',
                            'fmi', 'matematica', 'mate', 'info', 'informatica', 
                            'etti', 'electronica', 'telecomunicatii', 'fils', 'ism',

                            // 🏫 UNIVERSITĂȚI MARI (Dacă scriu doar numele universității)
                            'poli', 'politehnica', 'upb', 'unstpb',
                            'ase', 'economice',
                            'unibuc', 'ub', 'universitatea din bucuresti',
                            'umf', 'davila', 'medicina', 'farmacie', 'stomatologie', 'stoma',
                            'snspa',
                            'utcb', 'constructii',
                            'mincu', 'arhitectura', 'uauim', 'urbanism',
                            'usamv', 'agronomie', 'veterinara',
                            'unarte', 'arte',
                            'unatc', 'teatru', 'film',
                            'unefs', 'sport',
                            'titulescu', 'maiorescu', 'romano-americana', 'spiru', 'cantemir',

                            // 📊 ASE & ECONOMICE (Alte facultăți)
                            'fabiz', 'rei', 'finante', 'fabbv', 'cig', 'contabilitate', 
                            'marketing', 'management', 'eam', 'turism', 'business', 'economie',

                            // ⚙️ POLI (Alte facultăți)
                            'energetica', 'aerospatiala', 'transporturi', 'chimie', 'faima', 'fiir', 'isb', 'inginerie',

                            // 📚 UNIBUC & SNSPA (Uman / Social / Științe)
                            'drept', 'litere', 'flls', 'limbi straine', 'istorie', 'geografie', 
                            'fizica', 'biologie', 'filosofie', 'sociologie', 'sas', 'jurnalism', 
                            'fjsc', 'psihologie', 'fpise', 'comunicare', 'fcrp', 'administratie', 'fsp'
                        ];
                        
                        // Verificăm dacă textul introdus conține MĂCAR UNUL din cuvintele de mai sus
                        const isFound = allowedFaculties.some(keyword => val.includes(keyword));
                        
                        if (!isFound) {
                            // Dacă nu e în listă, BLOCĂM formularul!
                            input.setCustomValidity("Facultate nerecunoscută. Folosiți o prescurtare validă.");
                        } else {
                            // E în listă, deblocăm formularul.
                            input.setCustomValidity("");
                        }
                    }
                    // ====================================================

                    // Verificăm validitatea finală
                    if (input.checkValidity()) {
                        statusIndicator.innerHTML = "[VALID]";
                        statusIndicator.style.color = "#27c93f";
                        statusIndicator.style.textShadow = "0 0 8px #27c93f";
                    } else {
                        statusIndicator.innerHTML = "[ERR]";
                        statusIndicator.style.color = "var(--red-primary)";
                        statusIndicator.style.textShadow = "0 0 8px var(--red-primary)";
                    }
                }
            };

            input.addEventListener('input', checkInput);
            input.addEventListener('change', checkInput);
        });
    }

    // =================================================================
    // 🧹 URL CLEANER (Ascunde '#' din bara de adrese)
    // =================================================================
    
    // 1. Interceptăm toate click-urile pe link-urile cu ancoră (#)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Oprim browserul din a pune # în link
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Executăm scroll-ul fin manual
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Dacă meniul de pe mobil e deschis, îl închidem automat la click
                const navLinks = document.querySelector('.nav-links');
                const hamburger = document.querySelector('.hamburger');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    // 2. Curățăm URL-ul și la primul refresh (dacă cineva intră direct pe site.com/#home)
    window.addEventListener('load', () => {
        if (window.location.hash) {
            setTimeout(() => {
                // Ștergem hash-ul din istoric fără să dăm refresh
                history.replaceState(null, null, window.location.pathname);
            }, 10);
        }
    });

    // =================================================================
    // 🔙 BACK BUTTON FIX PENTRU FERESTRE MODALE (MOBILE SWIPE BACK)
    // =================================================================

    // 1. Senzor Inteligent: Detectează automat orice modal care se deschide
    const eventModals = document.querySelectorAll('.event-modal');
    
    eventModals.forEach(modal => {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === "class") {
                    // Dacă modalul primește clasa 'show', înseamnă că tocmai s-a deschis pe ecran
                    if (modal.classList.contains("show")) {
                        // Creăm un pas fals în istoricul telefonului
                        window.history.pushState({ modalOpen: true }, "", "#detalii");
                    }
                }
            });
        });
        observer.observe(modal, { attributes: true });
    });

    // 2. Interceptăm butonul de "Back" al telefonului sau gestul "Swipe Back"
    window.addEventListener('popstate', function(e) {
        const activeModal = document.querySelector('.event-modal.show');
        if (activeModal) {
            // Dacă un modal e deschis, îl ÎNCHIDEM noi forțat (și browserul "consumă" pasul fals de istoric)
            activeModal.classList.remove('show');
        }
    });

    // 3. Dacă utilizatorul închide manual din butonul de X (sau dând click pe afară)
    // Trebuie să ștergem manual pasul fals din istoric, ca să nu trebuiască să dea Back de 2 ori mai târziu!
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (window.location.hash === "#detalii") {
                window.history.back(); // Îi dăm noi un Back silențios
            }
        });
    });

    // Ascultăm și click-ul pe fundalul negru (care de obicei închide modalul)
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('event-modal') && event.target.classList.contains('show')) {
            if (window.location.hash === "#detalii") {
                window.history.back();
            }
        }
    });
});

})();