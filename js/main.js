(function() {
    "use strict"; 

    // Oprim preloader-ul dacă a fost deja văzut
    if (sessionStorage.getItem('preloaderShown') === 'true') {
        const tempStyle = document.createElement('style');
        tempStyle.innerHTML = '#preloader { display: none !important; }';
        document.head.appendChild(tempStyle);
    }

document.addEventListener('DOMContentLoaded', () => {
    console.log("System: Initializing Code Society Modules...");

    // =================================================================
    // 🌐 GLOBAL DATA FETCH (Creierul central)
    // Descărcăm datele în secunda zero, imediat ce se încarcă scriptul
    // =================================================================
    const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbzPju512R2QTCFNaDuE8ygFstGoXrBuRX35HOhOuiuTGWdIImlVRzOInpgDW7RaX_Z0/exec";
    
    // Promisiune globală: toate părțile site-ului vor aștepta după ea
    window.siteDataPromise = new Promise((resolve) => {
        const cachedDataStr = sessionStorage.getItem('preloadedSeats');
        if (cachedDataStr) {
            const cachedData = JSON.parse(cachedDataStr);
            // Dacă datele au fost luate în ultimele 2 minute, le folosim instant
            if (Date.now() - cachedData.time < 120000) { 
                resolve(cachedData.counts);
                return;
            }
        }

        fetch(GOOGLE_API_URL)
            .then(res => res.json())
            .then(data => {
                sessionStorage.setItem('preloadedSeats', JSON.stringify({ time: Date.now(), counts: data }));
                resolve(data);
            })
            .catch(err => {
                console.warn("> [EROARE] Baza de date indisponibilă.", err);
                resolve(null); // În caz de eroare, trecem mai departe ca să nu blocăm site-ul
            });
    });

    // =================================================================
    // 🔊 AUDIO SYSTEM
    // =================================================================
    const sounds = {
        hover: new Audio('assets/audio/hover.mp3'),
        click: new Audio('assets/audio/click.mp3'),
        key: new Audio('assets/audio/key.mp3'),
        success: new Audio('assets/audio/success.mp3'),
        tvOn: new Audio('assets/audio/tv-on.mp3'),      
        scrollTick: new Audio('assets/audio/scroll.mp3')    
    };

    sounds.hover.volume = 0.2;
    sounds.click.volume = 0.4;
    sounds.key.volume = 0.3;
    sounds.success.volume = 0.5;
    if (sounds.tvOn) sounds.tvOn.volume = 0.2;
    if (sounds.scrollTick) sounds.scrollTick.volume = 0.3;

    const playSound = (soundName) => {
        const audio = sounds[soundName];
        if (audio) {
            try {
               if (soundName === 'key') {
                    const clone = audio.cloneNode();
                    clone.volume = audio.volume;
                    clone.play().catch(() => { });
                    clone.onended = function() { clone.remove(); };
                }
                else if (soundName !== 'static') {
                    audio.currentTime = 0;
                    audio.play().catch(() => { });
                }
            } catch (e) { console.warn(`Audio '${soundName}' failed:`, e); }
        }
    };

    const uiElements = document.querySelectorAll('button, .btn, .terminal-submit, input, textarea, select, .event-card, .flip-card');
    uiElements.forEach(el => {
        el.addEventListener('mouseenter', () => playSound('hover'));
        el.addEventListener('mousedown', () => playSound('click'));
    });

    // =================================================================
    // 🚀 NAVIGARE SMART CATRE JOIN.HTML (Așteaptă baza de date!)
    // =================================================================
    const joinLinks = document.querySelectorAll('a[href*="join"]'); 
    
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
                const targetAttr = this.getAttribute('href');
                if (!targetAttr || targetAttr.startsWith('#')) return;
                const currentUrl = window.location.href.toLowerCase();
                if (currentUrl.includes('join.html') || currentUrl.endsWith('/join') || currentUrl.endsWith('/join/')) return; 

                e.preventDefault(); 
                const fullUrl = this.href; 
                overlay.style.display = 'flex';
                overlay.innerHTML = ''; 
                if (typeof playSound === 'function') playSound('click');

                let fetchDone = false;
                let animDone = false;

                const triggerRedirect = () => {
                    if (fetchDone && animDone) {
                        setTimeout(() => { window.location.href = fullUrl; }, 200);
                    }
                };

                // Re-Fetch de siguranță când apasă butonul
                fetch(GOOGLE_API_URL)
                    .then(res => res.json())
                    .then(data => {
                        sessionStorage.setItem('preloadedSeats', JSON.stringify({ time: Date.now(), counts: data }));
                    })
                    .catch(() => {})
                    .finally(() => {
                        fetchDone = true;
                        if (animDone && overlay.style.display === 'flex') {
                            const p = document.createElement('div');
                            p.className = 'term-line';
                            p.innerHTML = `> SYNC COMPLETE. SYSTEM ACCESS GRANTED.`;
                            overlay.appendChild(p);
                            if (typeof playSound === 'function') playSound('key');
                            triggerRedirect();
                        }
                    });

                const bootSequence = [
                    `> INITIATING SECURE UPLINK...`,
                    `> BYPASSING FIREWALL [PROXY_22]...`,
                    `> AUTHENTICATING USER... <span style="color: #27c93f; font-weight: bold;">OK</span>`,
                    `> DOWNLOADING EVENT MANIFEST...` 
                ];

                let delay = 0;
                bootSequence.forEach((line, index) => {
                    setTimeout(() => {
                        const p = document.createElement('div');
                        p.className = 'term-line';
                        p.innerHTML = line;
                        overlay.appendChild(p);
                        if (typeof playSound === 'function') playSound('key');
                        overlay.scrollTop = overlay.scrollHeight;

                        if (index === bootSequence.length - 1) {
                            animDone = true;
                            if (fetchDone) {
                                setTimeout(() => {
                                    const pFinal = document.createElement('div');
                                    pFinal.className = 'term-line';
                                    pFinal.innerHTML = `> SYSTEM ACCESS GRANTED.`;
                                    overlay.appendChild(pFinal);
                                    if (typeof playSound === 'function') playSound('key');
                                    triggerRedirect();
                                }, 300);
                            }
                        }
                    }, delay);
                    delay += 200;
                });
                
                // Failsafe: Dacă durează peste 4s, intrăm forțat
                setTimeout(() => {
                    if (!fetchDone) {
                        fetchDone = true; 
                        triggerRedirect();
                    }
                }, 4000);
            });
        });
    }

    const inputFields = document.querySelectorAll('input, textarea');
    if (inputFields.length > 0) {
        inputFields.forEach(field => {
            field.addEventListener('keydown', (e) => {
                if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') playSound('key');
            });
        });
    }

    // =================================================================
    // 🛠️ PRELOADER INTELIGENT (Legat de Baza de Date)
    // =================================================================
    const preloader = document.getElementById('preloader');
    const consoleText = document.querySelector('.console-text'); 

    if (preloader) {
        if (sessionStorage.getItem('preloaderShown') === 'true') {
            preloader.style.display = 'none';
        } else {
            window.addEventListener('load', function () {
                if(consoleText) consoleText.innerHTML = "> Fetching event manifest...";
                
                // Așteptăm MINIM 2 secunde (pentru animație), dar și ca Google să ne trimită datele
                const minTimePromise = new Promise(res => setTimeout(res, 2000));
                
                Promise.all([window.siteDataPromise, minTimePromise]).then(() => {
                    if(consoleText) consoleText.innerHTML = "> System Ready. Access Granted.";
                    
                    setTimeout(() => {
                        preloader.classList.add('preloader-hidden');
                        sessionStorage.setItem('preloaderShown', 'true');
                        setTimeout(() => { preloader.style.display = 'none'; }, 500);
                    }, 500); // Îl lăsăm puțin ca să poată citi textul "Access Granted"
                });
            });
        }
    }

    // --- RESTUL MODULELOR UI ---
    if (history.scrollRestoration) history.scrollRestoration = 'manual';
    else window.onbeforeunload = function () { window.scrollTo(0, 0); }

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

    const titleElement = document.querySelector('.hero-content h1');
    if (titleElement) {
        const textToType = "BUILDING THE FUTURE BIT BY BIT";
        if (sessionStorage.getItem('typewriterShown') === 'true') {
            titleElement.innerHTML = "." + textToType + '<span class="blinking-cursor">_</span>';
        } else {
            titleElement.innerHTML = ".";
            let i = 0;
            function typeWriter() {
                if (i < textToType.length) {
                    titleElement.innerHTML += textToType.charAt(i);
                    i++;
                    setTimeout(typeWriter, 75); 
                } else {
                    titleElement.innerHTML += '<span class="blinking-cursor">_</span>';
                    sessionStorage.setItem('typewriterShown', 'true');
                }
            }
            setTimeout(typeWriter, 500);
        }
    }   

    const reveals = document.querySelectorAll(".reveal");
    if (reveals.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    entry.target.style.transitionDelay = "0ms"; 
                } else {
                    entry.target.classList.remove("active");
                }
            });
        }, { root: null, threshold: 0.15 });
        reveals.forEach(reveal => revealObserver.observe(reveal));
    }

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

    const horizontalGrids = document.querySelectorAll('.events-grid, .team-grid-full');
    if (horizontalGrids.length > 0) {
        horizontalGrids.forEach(grid => {
            grid.addEventListener('wheel', (e) => {
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
                if (e.deltaY !== 0) {
                    e.preventDefault(); 
                    grid.scrollLeft += e.deltaY * 3; 
                }
            }, { passive: false });
        });
    }

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

    const spySections = document.querySelectorAll('section');
    const navSpyLinks = document.querySelectorAll('.nav-links a');
    const isHomePage = document.getElementById('home'); 
    if (spySections.length > 0 && navSpyLinks.length > 0 && isHomePage) {
        function updateScrollSpy() {
            let currentSection = '';
            const navHeight = 100; 
            if (window.scrollY < 50) currentSection = 'home';
            else {
                spySections.forEach(section => {
                    const sectionTop = section.offsetTop - navHeight;
                    const sectionHeight = section.offsetHeight;
                    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                        currentSection = section.getAttribute('id');
                    }
                });
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
                    const lastSection = spySections[spySections.length - 1];
                    if (lastSection) currentSection = lastSection.getAttribute('id');
                }
            }
            navSpyLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href.includes('#')) {
                    link.classList.remove('active-link');
                    if (currentSection && href.includes('#' + currentSection)) link.classList.add('active-link');
                }
            });
        }
        window.addEventListener('scroll', updateScrollSpy);
        window.addEventListener('load', updateScrollSpy);
        updateScrollSpy();
    }

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
    // 🐇 KONAMI CODE (MATRIX MODE)
    // =================================================================
    const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let sequence = [];
    function applyMatrixTheme() {
        document.body.classList.add('matrix-mode');
        const logos = document.querySelectorAll('.logo-img');
        logos.forEach(logo => {
            if (!logo.src.includes('logo-verde.png')) logo.src = 'assets/img/logo-verde.png';
        });
        const video = document.getElementById('bgVideo');
        if (video && !video.src.includes('matrix.mp4')) {
            video.src = 'assets/video/matrix.mp4';
            video.load();
            video.play().catch(()=>{});
        }
        const marqueeTexts = document.querySelectorAll('.marquee-content');
        marqueeTexts.forEach(contentBlock => {
            contentBlock.innerHTML = "SYSTEM COMPROMISED /// WELCOME TO THE REAL WORLD /// FOLLOW THE WHITE RABBIT /// SYSTEM COMPROMISED /// WELCOME TO THE REAL WORLD /// FOLLOW THE WHITE RABBIT /// ";
        });
    }
    if (sessionStorage.getItem('matrixMode') === 'true') applyMatrixTheme();
    window.addEventListener('keydown', (e) => {
        sequence.push(e.key);
        if (sequence.length > secretCode.length) sequence.shift();
        if (JSON.stringify(sequence) === JSON.stringify(secretCode)) {
            if (sessionStorage.getItem('matrixMode') !== 'true') {
                console.log("SYSTEM HACKED: MATRIX MODE ENGAGED");
                alert("SYSTEM HACKED! WELCOME TO THE MATRIX.");
                sessionStorage.setItem('matrixMode', 'true');
                applyMatrixTheme();
            }
            sequence = []; 
        }
    });

    // =================================================================
    // FORMULAR (JOIN.HTML)
    // =================================================================
    const hackerForm = document.getElementById('hackerForm');
    const terminalBody = document.querySelector('.terminal-body');
    const eventSelect = document.getElementById('event_select');
    
    if (eventSelect) {
        const urlParams = new URLSearchParams(window.location.search);
        const eventName = urlParams.get('event');
        if (eventName) {
            let optionExists = false;
            for (let i = 0; i < eventSelect.options.length; i++) {
                if (eventSelect.options[i].value === eventName) {
                    optionExists = true; break;
                }
            }
            if (!optionExists) {
                const newOption = document.createElement('option');
                newOption.value = eventName;
                newOption.text = eventName;
                eventSelect.add(newOption);
            }
            eventSelect.value = eventName;
        }

        // show/hide hackathon fields based on selection
        function checkHackathonVisibility() {
            const selected = eventSelect.options[eventSelect.selectedIndex];
            const text = selected ? selected.text : '';
            const hackSection = document.getElementById('hackathon-section');
            const teamSection = document.getElementById('hack-teammates');
            const faqSection = document.getElementById('faq-section');
            const member1 = document.getElementById('teammate1_name');
            const member1Email = document.getElementById('teammate1_email');
            const member2 = document.getElementById('teammate2_name');
            const member2Email = document.getElementById('teammate2_email');
            const member3 = document.getElementById('teammate3_name');
            const member3Email = document.getElementById('teammate3_email');
            const diff = document.getElementById('hack_difficulty');
            if (/hackathon|CTF/i.test(text)) {
                if (hackSection) hackSection.style.display = 'flex';
                if (teamSection) teamSection.style.display = 'block';
                if (faqSection) faqSection.style.display = 'block';
                if (diff) diff.required = true;
                if (member1) member1.required = true;
                if (member1Email) member1Email.required = true;
                if (member2) member2.required = true;
                if (member2Email) member2Email.required = true;
                if (member3) member3.required = false;
                if (member3Email) member3Email.required = false;
            } else {
                if (hackSection) hackSection.style.display = 'none';
                if (teamSection) teamSection.style.display = 'none';
                if (faqSection) faqSection.style.display = 'none';
                if (diff) diff.required = false;
                if (member1) member1.required = false;
                if (member1Email) member1Email.required = false;
                if (member2) member2.required = false;
                if (member2Email) member2Email.required = false;
                if (member3) member3.required = false;
                if (member3Email) member3Email.required = false;
            }
        }
        eventSelect.addEventListener('change', checkHackathonVisibility);
        // run once in case pre-selected via URL
        checkHackathonVisibility();
    }

    if (hackerForm && terminalBody) {
        hackerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const honeypot = document.getElementById('website_url');
            if (honeypot && honeypot.value !== "") {
                console.warn("SYSTEM DEFENSE: Bot activity detected. Connection terminated.");
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
                return; 
            }
            // hackathon-specific team size validation
            const hackSection = document.getElementById('hackathon-section');
            if (hackSection && hackSection.style.display !== 'none') {
                const m1n = document.getElementById('teammate1_name');
                const m1e = document.getElementById('teammate1_email');
                const m2n = document.getElementById('teammate2_name');
                const m2e = document.getElementById('teammate2_email');
                const m3n = document.getElementById('teammate3_name');
                const m3e = document.getElementById('teammate3_email');
                // first two teammates mandatory (both name and email)
                if (!m1n || !m1n.value.trim() || !m1e || !m1e.value.trim()) {
                    alert("Teammate 1 este obligatoriu: completează numele și email-ul.");
                    return;
                }
                if (!m2n || !m2n.value.trim() || !m2e || !m2e.value.trim()) {
                    alert("Teammate 2 este obligatoriu: completează numele și email-ul.");
                    return;
                }
                // if user starts filling teammate3, require both fields
                if ((m3n && m3n.value.trim() && (!m3e || !m3e.value.trim())) ||
                    (m3e && m3e.value.trim() && (!m3n || !m3n.value.trim()))) {
                    alert("Dacă adaugi al treilea coleg, completează atât numele cât și email-ul lui.");
                    return;
                }
            }
            function sanitizeInput(str) {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            }
            const data = new FormData(hackerForm);
            const rawName = document.getElementById('name').value;
            const nameVal = sanitizeInput(rawName);
            data.set('name', nameVal);
            // sanitize any hackathon teammate inputs as well
            for (let i = 1; i <= 3; i++) {
                const tn = document.getElementById(`teammate${i}_name`);
                const te = document.getElementById(`teammate${i}_email`);
                if (tn && tn.value) data.set(tn.name, sanitizeInput(tn.value));
                if (te && te.value) data.set(te.name, sanitizeInput(te.value));
            }
            const eventVal = eventSelect ? eventSelect.value : "Unknown";

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

            setTimeout(() => {
                fetch(hackerForm.action, {
                    method: 'POST',
                    mode: 'no-cors', 
                    body: data
                }).then(() => {
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
                    hackerForm.reset(); 
                }).catch(error => {
                    console.error("Fetch Error:", error);
                    printLog(`<span style="color:red; font-weight:bold;">[CRITICAL] Network unavailable.</span>`);
                    printLog(`> Fatal error detected. Rerouting...`);
                    setTimeout(() => { window.location.href = '404.html'; }, 1500);
                });
            }, delay + 500);
        });
    }

    // =================================================================
    // 📺 HORIZONTAL SCROLL + TV LOGIC
    // =================================================================
    const stickySection = document.querySelector('.horizontal-scroll-section');
    const track = document.querySelector('.horizontal-track');
    const tvScreen = document.querySelector('.tv-screen-container');
    const tvHeader = document.querySelector('.sponsors-header'); 

    if (tvScreen && tvHeader) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!tvScreen.classList.contains('tv-active')) {
                        tvScreen.classList.add('tv-active');
                        if (typeof playSound === 'function') playSound('tvOn'); 
                    }
                } else {
                    if (entry.boundingClientRect.top > 0) tvScreen.classList.remove('tv-active');
                }
            });
        }, { threshold: 0.1 }); 
        observer.observe(tvHeader); 
    }

    if (stickySection && track && window.innerWidth > 768) {
        let lastSoundPosition = 0;
        const clickDistance = 50;
        window.addEventListener('scroll', () => {
            const sectionTop = stickySection.getBoundingClientRect().top;
            const scrollDistance = stickySection.offsetHeight - window.innerHeight;
            const trackWidth = track.scrollWidth - window.innerWidth + 200;
            const isInTvSection = (sectionTop <= 0 && -sectionTop < scrollDistance);

            if (isInTvSection) {
                const progress = Math.abs(sectionTop) / scrollDistance;
                const moveX = progress * trackWidth;
                track.style.transform = `translateX(-${moveX}px)`;
                if (Math.abs(moveX - lastSoundPosition) > clickDistance) {
                    if (typeof sounds !== 'undefined' && sounds.scrollTick) {
                        const clone = sounds.scrollTick.cloneNode();
                        clone.volume = 0.2;
                        clone.playbackRate = 0.9 + Math.random() * 0.2;
                        clone.play().catch(() => { });
                    }
                    lastSoundPosition = moveX;
                }
            } else {
                if (-sectionTop >= scrollDistance) track.style.transform = `translateX(-${trackWidth}px)`;
                else if (sectionTop > 0) track.style.transform = `translateX(0px)`;
            }
        });
    }

    // =================================================================
    // 🎟️ EVENT MODAL LOGIC (Cu SOLD OUT Integration)
    // =================================================================
    const modal = document.getElementById('eventModal');
    const modalBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtn = document.querySelector('.close-modal');

    if (modal && modalBtns.length > 0) {
        const mTitle = document.getElementById('modalTitle');
        const mTag = document.getElementById('modalTag');
        const mDate = document.getElementById('modalDate');
        const mLocation = document.getElementById('modalLocation');
        const mDesc = document.getElementById('modalDescription');
        const mImg = document.getElementById('modalImage');

        if (mImg && !mImg.parentElement.classList.contains('modal-img-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'modal-img-wrapper';
            wrapper.style.position = 'relative'; 
            mImg.parentNode.insertBefore(wrapper, mImg);
            wrapper.appendChild(mImg);
        }

        modalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); 
                mTitle.textContent = btn.getAttribute('data-title');
                mTag.textContent = btn.getAttribute('data-tag');
                mDate.innerHTML = `📅 ${btn.getAttribute('data-date')}`;
                mLocation.innerHTML = `📍 ${btn.getAttribute('data-location')}`;
                mDesc.innerHTML = btn.getAttribute('data-desc'); 
                
                const eventName = btn.getAttribute('data-title');
                const modalJoinBtn = document.querySelector('.modal-footer a');
                
                const imgSrc = btn.getAttribute('data-image');
                if (imgSrc && imgSrc !== "") {
                    mImg.src = imgSrc;
                    mImg.style.display = 'block';
                } else {
                    mImg.style.display = 'none'; 
                }

                const parentCard = btn.closest('.event-card');
                const isSoldOut = parentCard && parentCard.classList.contains('sold-out-event');
                const imgWrapper = mImg.parentElement;

                const oldBadge = imgWrapper.querySelector('.sold-out-badge');
                if (oldBadge) oldBadge.remove();

                if (isSoldOut) {
                    mImg.style.filter = 'grayscale(50%) brightness(0.7)';
                    if (mImg.style.display !== 'none') {
                        const badge = document.createElement('div');
                        badge.className = 'sold-out-badge';
                        badge.innerHTML = 'REGISTRATION CLOSED';
                        imgWrapper.appendChild(badge);
                    }
                    if (modalJoinBtn) {
                        modalJoinBtn.innerHTML = '> REGISTRATION CLOSED';
                        modalJoinBtn.style.pointerEvents = 'none'; 
                        modalJoinBtn.style.color = '#C41E3A';      
                        modalJoinBtn.style.borderColor = '#C41E3A';
                        modalJoinBtn.style.opacity = '0.8';
                        modalJoinBtn.removeAttribute('href');      
                    }
                } else {
                    mImg.style.filter = 'none';
                    if (modalJoinBtn) {
                        modalJoinBtn.innerHTML = '> REZERVĂ LOC ACUM';
                        modalJoinBtn.style.pointerEvents = 'auto'; 
                        modalJoinBtn.style.color = '';
                        modalJoinBtn.style.borderColor = '';
                        modalJoinBtn.style.opacity = '1';
                        modalJoinBtn.href = `join.html?event=${encodeURIComponent(eventName)}`;
                    }
                }

                modal.classList.add('show');
                if (typeof playSound === 'function') playSound('click');
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', () => { modal.classList.remove('show'); });
        window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    }

    // =================================================================
    // 🟢 LIVE FORM VALIDATION
    // =================================================================
    const formInputs = document.querySelectorAll('.terminal-input-group input[type="text"], .terminal-input-group input[type="email"], .terminal-input-group input[type="tel"], .terminal-input-group select');
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
                    input.setCustomValidity(""); 
                } else {
                    if (input.id === 'faculty') {
                        const val = input.value.toLowerCase();
                        const allowedFaculties = [
                            'csie', 'cibernetica', 'acs', 'automatica', 'calculatoare', 'cti',
                            'fmi', 'matematica', 'mate', 'info', 'informatica', 
                            'etti', 'electronica', 'telecomunicatii', 'fils', 'ism',
                            'poli', 'politehnica', 'upb', 'unstpb', 'ase', 'economice',
                            'unibuc', 'ub', 'universitatea din bucuresti',
                            'umf', 'davila', 'medicina', 'farmacie', 'stomatologie', 'stoma',
                            'snspa', 'utcb', 'constructii', 'mincu', 'arhitectura', 'uauim', 'urbanism',
                            'usamv', 'agronomie', 'veterinara', 'unarte', 'arte',
                            'unatc', 'teatru', 'film', 'unefs', 'sport',
                            'titulescu', 'maiorescu', 'romano-americana', 'spiru', 'cantemir',
                            'fabiz', 'rei', 'finante', 'fabbv', 'cig', 'contabilitate', 
                            'marketing', 'management', 'eam', 'turism', 'business', 'economie',
                            'energetica', 'aerospatiala', 'transporturi', 'chimie', 'faima', 'fiir', 'isb', 'inginerie',
                            'drept', 'litere', 'flls', 'limbi straine', 'istorie', 'geografie', 
                            'fizica', 'biologie', 'filosofie', 'sociologie', 'sas', 'jurnalism', 
                            'fjsc', 'psihologie', 'fpise', 'comunicare', 'fcrp', 'administratie', 'fsp'
                        ];
                        const isFound = allowedFaculties.some(keyword => val.includes(keyword));
                        if (!isFound) input.setCustomValidity("Facultate nerecunoscută. Folosiți o prescurtare validă.");
                        else input.setCustomValidity("");
                    }
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

    // Clean Nav & Back Logic
    document.querySelectorAll('.nav-links a, .footer-links a, .logo-link').forEach(link => {
        link.addEventListener('click', function(e) {
            let href = this.getAttribute('href');
            if (href && href.includes('#')) {
                let targetId = href.substring(href.indexOf('#'));
                let targetSection = document.querySelector(targetId);
                if (targetSection) {
                    e.preventDefault(); 
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    history.replaceState(null, null, window.location.pathname);
                    const navLinks = document.querySelector('.nav-links');
                    const hamburger = document.querySelector('.hamburger');
                    if (navLinks && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        hamburger.classList.remove('active');
                    }
                }
            }
        });
    });

    const eventModals = document.querySelectorAll('.event-modal');
    eventModals.forEach(modal => {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === "class" && modal.classList.contains("show")) {
                    window.history.pushState({ modalOpen: true }, "", "#detalii");
                }
            });
        });
        observer.observe(modal, { attributes: true });
    });
    window.addEventListener('popstate', function(e) {
        const activeModal = document.querySelector('.event-modal.show');
        if (activeModal) activeModal.classList.remove('show');
    });
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() { if (window.location.hash === "#detalii") window.history.back(); });
    });
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('event-modal') && event.target.classList.contains('show')) {
            if (window.location.hash === "#detalii") window.history.back();
        }
    });

    // =================================================================
    // NOU: Curățare URL la încărcarea paginii (Când vii de pe about.html)
    // =================================================================
    window.addEventListener('load', () => {
        if (window.location.hash && window.location.hash !== '#detalii') {
            setTimeout(() => {
                history.replaceState(null, null, window.location.pathname + window.location.search);
            }, 10);
        }
    });

    // ==========================================================================
    // 🛡️ EVENT CARDS & SOLD OUT LOGIC (Așteaptă baza de date din preloader)
    // ==========================================================================
    const now = new Date();
    const eventLimits = {
        "GENERATED GENERATION": 100,
        "BUCURESTI: BECOME HUMAN": 40,
        "ACCESS GRANTED: FUTURE IS NOT SECURE": 100,
        "Ai incuiat usa? - CTF": 40,
        "Full stacking your way to succes": 100,
        "Byte into the Coding World": 40,
        "Don't reach for the sky, reach for the Cloud.": 100,
        "Head in the clouds, feet on the code": 40
    };

    const eventCards = document.querySelectorAll('.event-card');
    const joinEventSelect = document.getElementById("event_select");

    // 1. TIMP: Deblochează sau Închide pe baza Datei Calendaristice (Executat Instant)
    eventCards.forEach(card => {
        const unlockDateStr = card.getAttribute('data-unlock-date');
        const endDateStr = card.getAttribute('data-end-date');
        if (unlockDateStr && endDateStr) {
            const unlockDate = new Date(unlockDateStr);
            const endDate = new Date(endDateStr);
            if (now > endDate) {
                card.classList.remove('locked-event');
                card.classList.add('completed-event');
                if(!card.querySelector('.completed-overlay')) {
                    const checkMark = document.createElement('div');
                    checkMark.className = 'completed-overlay';
                    checkMark.innerHTML = '[✔] COMPLETED';
                    card.appendChild(checkMark);
                }
            } else if (now >= unlockDate) {
                card.classList.remove('locked-event');
                card.classList.remove('completed-event');
            } else {
                card.classList.add('locked-event');
            }
        }
    });

    if (joinEventSelect) {
        const formOptions = document.querySelectorAll('.form-event-option');
        formOptions.forEach(option => {
            const unlockDateStr = option.getAttribute('data-unlock-date');
            const endDateStr = option.getAttribute('data-end-date');
            if (unlockDateStr && endDateStr) {
                const unlockDate = new Date(unlockDateStr);
                const endDate = new Date(endDateStr);
                if (!option.getAttribute('data-original-text')) option.setAttribute('data-original-text', option.textContent.trim());
                const originalText = option.getAttribute('data-original-text');

                if (now < unlockDate) {
                    option.style.display = 'none'; option.disabled = true;
                } else if (now >= unlockDate && now <= endDate) {
                    option.style.display = ''; option.disabled = false; option.textContent = originalText; 
                } else if (now > endDate) {
                    option.style.display = ''; option.disabled = true;
                    option.textContent = "[✔] " + originalText + " (ÎNCHEIAT)";
                    option.style.color = "#00FF41"; 
                }
            }
        });
    }

    // 2. CAPACITATE (Registration Closed) - Instant Memory Check
    if (eventCards.length > 0 || joinEventSelect) {
        const loadingOption = document.getElementById('loading_option');

        const applySoldOutLogic = (occupiedCounts) => {
            if(!occupiedCounts) return; 

            // Aplicăm pentru formularul din join.html
            if (joinEventSelect) {
                Array.from(joinEventSelect.options).forEach(option => {
                    const eventName = option.value;
                    if (option.disabled && option.textContent.includes("(ÎNCHEIAT)")) return;

                    if (eventLimits[eventName] !== undefined) {
                        const currentOccupied = occupiedCounts[eventName] || 0;
                        if (currentOccupied >= eventLimits[eventName]) {
                            option.disabled = true; 
                            const originalText = option.getAttribute('data-original-text') || option.textContent;
                            option.textContent = "[REGISTRATION CLOSED] " + originalText;
                            option.style.color = "#C41E3A"; 
                            option.style.fontWeight = "bold";
                        }
                    }
                });
                joinEventSelect.disabled = false;
                if (loadingOption) loadingOption.textContent = "[ SELECTEAZĂ EVENIMENTUL ]";
            }

            // Aplicăm pentru cardurile din index.html
            if (eventCards.length > 0) {
                eventCards.forEach(card => {
                    const titleEl = card.querySelector('.event-title');
                    if (!titleEl) return;
                    const eventName = titleEl.innerText.trim();

                    if (eventLimits[eventName] !== undefined) {
                        const currentOccupied = occupiedCounts[eventName] || 0;
                        if (currentOccupied >= eventLimits[eventName] && 
                           !card.classList.contains('locked-event') && 
                           !card.classList.contains('completed-event')) {
                            
                            card.classList.add('sold-out-event');
                            const imageWrapper = card.querySelector('.card-image-wrapper');
                            if(imageWrapper && !imageWrapper.querySelector('.sold-out-badge')) {
                                const badge = document.createElement('div');
                                badge.className = 'sold-out-badge';
                                badge.innerHTML = 'REGISTRATION CLOSED';
                                imageWrapper.appendChild(badge);
                            }
                        }
                    }
                });
            }
        };

        // ==============================================================
        // 🧠 NOU: Verificare Sincronă (Instant) din Memorie
        // ==============================================================
        let isDataApplied = false;
        const cachedStr = sessionStorage.getItem('preloadedSeats');
        
        if (cachedStr) {
            const cachedData = JSON.parse(cachedStr);
            // Dacă datele sunt încă proaspete (sub 2 minute) le aplicăm FĂRĂ DELAY
            if (Date.now() - cachedData.time < 120000) {
                console.log("> [SISTEM] Date încărcate INSTANT din memorie la reload.");
                applySoldOutLogic(cachedData.counts);
                isDataApplied = true; 
            }
        }

        // Dacă nu avem date în memorie (ex: prima vizită absolută a site-ului), așteptăm serverul
        if (!isDataApplied && window.siteDataPromise) {
            window.siteDataPromise.then(counts => {
                if (counts) {
                    applySoldOutLogic(counts);
                } else {
                    if (joinEventSelect) joinEventSelect.disabled = false;
                    if (loadingOption) loadingOption.textContent = "[ SELECTEAZĂ EVENIMENTUL ]";
                }
            });
        }
    }

}); // Finalul uriașului 'DOMContentLoaded'
})(); // Finalul modulului strict (IIFE)