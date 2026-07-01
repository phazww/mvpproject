/* =====================================================
   MVP PROJECT — Scripts
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Interactive Web Audio Controller ─────────────────
    const AudioController = {
        enabled: localStorage.getItem('sound_enabled') === 'true',
        ctx: null,
        
        init() {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
        },
        
        toggle() {
            this.enabled = !this.enabled;
            localStorage.setItem('sound_enabled', this.enabled);
            this.updateIcons();
            if (this.enabled) {
                this.playTick();
            }
        },
        
        updateIcons() {
            const mutedIcon = document.querySelector('.sound-icon-muted');
            const unmutedIcon = document.querySelector('.sound-icon-unmuted');
            const btn = document.getElementById('nav-sound-btn');
            
            if (btn) {
                btn.setAttribute('aria-label', this.enabled ? 'Выключить звук' : 'Включить звук');
            }
            if (this.enabled) {
                if (mutedIcon) mutedIcon.style.display = 'none';
                if (unmutedIcon) unmutedIcon.style.display = 'block';
            } else {
                if (mutedIcon) mutedIcon.style.display = 'block';
                if (unmutedIcon) unmutedIcon.style.display = 'none';
            }
        },
        
        playTick() {
            if (!this.enabled) return;
            try {
                this.init();
                if (this.ctx.state === 'suspended') this.ctx.resume();
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.05);
                
                gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(this.ctx.currentTime + 0.05);
            } catch (e) { console.warn(e); }
        },
        
        playHover() {
            if (!this.enabled) return;
            try {
                this.init();
                if (this.ctx.state === 'suspended') this.ctx.resume();
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(500, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.04);
                
                gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(this.ctx.currentTime + 0.04);
            } catch (e) { console.warn(e); }
        },
        
        playSuccess() {
            if (!this.enabled) return;
            try {
                this.init();
                if (this.ctx.state === 'suspended') this.ctx.resume();
                
                const now = this.ctx.currentTime;
                
                const playTone = (freq, time, dur) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, time);
                    gain.gain.setValueAtTime(0.03, time);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(time);
                    osc.stop(time + dur);
                };
                
                playTone(800, now, 0.08);
                playTone(1000, now + 0.08, 0.1);
                playTone(1200, now + 0.18, 0.2);
            } catch (e) { console.warn(e); }
        }
    };
    
    // Bind Sound Toggle Button
    const soundToggleBtn = document.getElementById('nav-sound-btn');
    if (soundToggleBtn) {
        AudioController.updateIcons();
        soundToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            AudioController.toggle();
        });
    }

    function bindInteractiveSounds() {
        const hoverElements = document.querySelectorAll('a, button, [data-ip], .feat-card, .user-profile-widget, .social-link');
        hoverElements.forEach(el => {
            // Remove previous listeners to avoid duplicates
            el.removeEventListener('mouseenter', playHoverSound);
            el.removeEventListener('click', playClickSound);
            
            el.addEventListener('mouseenter', playHoverSound);
            el.addEventListener('click', playClickSound);
        });
    }

    function playHoverSound() { AudioController.playHover(); }
    function playClickSound() { AudioController.playTick(); }
    
    // Initial sound binding
    bindInteractiveSounds();


    // ─── Preloader Terminal Boot Sequence ───────────────
    const preloader = document.getElementById('preloader');
    const logsContainer = document.getElementById('terminal-logs');
    
    const logs = [
        "Connecting to MVP Core network...",
        "[OK] Host 62.109.0.49:27015 responsive",
        "[OK] Tickrate verified: Sub-tick (64 Hz)",
        "[OK] Anti-Cheat (VAC Net v2): ACTIVE",
        "[OK] Game Mode: CS2 Maniac",
        "[OK] Interface ready. Enjoy."
    ];

    async function runTerminalLogs() {
        if (!logsContainer) {
            setTimeout(hidePreloader, 1000);
            return;
        }

        // Проверяем, видел ли пользователь уже загрузку
        if (sessionStorage.getItem('preloaderVisited') === 'true') {
            preloader.style.display = 'none'; // Мгновенно скрываем
            return;
        }

        for (let i = 0; i < logs.length; i++) {
            const line = document.createElement('div');
            logsContainer.appendChild(line);
            
            const text = logs[i];
            // Анимация печати букв (Typewriter effect)
            for (let j = 0; j < text.length; j++) {
                line.textContent += text[j];
                logsContainer.scrollTop = logsContainer.scrollHeight;
                await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20)); // Очень быстрая печать
            }
            // Пауза между строчками
            await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
        }

        await new Promise(resolve => setTimeout(resolve, 400));
        sessionStorage.setItem('preloaderVisited', 'true');
        hidePreloader();
    }

    function hidePreloader() {
        if (preloader && !preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
            AudioController.playSuccess();
        }
    }

    // Safety fallback
    setTimeout(() => {
        hidePreloader();
    }, 4500);

    // Run Preloader Sequence on load
    window.addEventListener('load', () => {
        runTerminalLogs();
    });


    // ─── Particle System (Retina / DPR Fixed) ───────────
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let mouseX = -1000;
        let mouseY = -1000;

        const PARTICLE_COUNT = 40;
        const PARTICLE_COLOR = 'rgba(212, 175, 55, ';
        const CONNECT_DIST = 140;

        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
        }
        
        function getCanvasWidth() {
            return window.innerWidth;
        }

        function getCanvasHeight() {
            return window.innerHeight;
        }

        function createParticle() {
            return {
                x: Math.random() * getCanvasWidth(),
                y: Math.random() * getCanvasHeight(),
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.4 + 0.1,
            };
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(createParticle());
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, getCanvasWidth(), getCanvasHeight());

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = getCanvasWidth();
                if (p.x > getCanvasWidth()) p.x = 0;
                if (p.y < 0) p.y = getCanvasHeight();
                if (p.y > getCanvasHeight()) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = PARTICLE_COLOR + p.alpha + ')';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECT_DIST) {
                        const lineAlpha = (1 - dist / CONNECT_DIST) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = PARTICLE_COLOR + lineAlpha + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                if (mouseX > 0 && mouseY > 0) {
                    const mdx = p.x - mouseX;
                    const mdy = p.y - mouseY;
                    const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (mDist < 180) {
                        const lineAlpha = (1 - mDist / 180) * 0.2;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.strokeStyle = PARTICLE_COLOR + lineAlpha + ')';
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(drawParticles);
        }

        resizeCanvas();
        initParticles();
        drawParticles();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                initParticles();
            }, 200);
        });

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });
    }


    // ─── Navbar Scroll & Scroll Hint ────────────────────
    const navbar = document.getElementById('navbar');
    const scrollHint = document.getElementById('scroll-hint');

    const handleScroll = () => {
        if (!navbar) return;
        const scrolled = window.scrollY > 60;
        navbar.classList.toggle('scrolled', scrolled);
        if (scrollHint) {
            scrollHint.style.opacity = scrolled ? '0' : '1';
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();


    // ─── Mobile Menu ────────────────────────────────────
    const burger = document.getElementById('burger-btn');
    const overlay = document.getElementById('mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    const toggleMobile = () => {
        if (!overlay || !burger) return;
        const isOpen = overlay.classList.contains('open');
        overlay.classList.toggle('open');
        burger.classList.toggle('active');
        document.body.style.overflow = isOpen ? '' : 'hidden';
    };

    if (burger) burger.addEventListener('click', toggleMobile);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (overlay && overlay.classList.contains('open')) {
                toggleMobile();
            }
        });
    });


    // ─── Toast System ───────────────────────────────────
    const toastContainer = document.getElementById('toast-container');

    function showToast(message, isSuccess = true) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = isSuccess 
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>${message}</span>`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>${message}</span>`;
        
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }


    // ─── Copy IP with Visual Feedback ──────────────────
    function copyIP(ip, btn) {
        const runCopySuccess = () => {
            showToast('IP скопирован!');
            AudioController.playSuccess();
            if (btn) {
                btn.classList.add('copy-success');
                const label = btn.querySelector('.cta-label') || btn.querySelector('span');
                if (label) {
                    const originalText = label.textContent;
                    label.textContent = 'Скопировано!';
                    setTimeout(() => {
                        label.textContent = originalText;
                        btn.classList.remove('copy-success');
                    }, 2000);
                }
            }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ip).then(() => {
                runCopySuccess();
            }).catch(() => {
                fallbackCopy(ip, btn, runCopySuccess);
            });
        } else {
            fallbackCopy(ip, btn, runCopySuccess);
        }
    }

    function fallbackCopy(text, btn, successCallback) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            successCallback();
        } catch (e) {
            showToast('Ошибка копирования', false);
        }
        document.body.removeChild(ta);
    }

    document.querySelectorAll('[data-ip]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            copyIP(btn.getAttribute('data-ip'), btn);
        });
    });


    // ─── DYNAMIC LOGO PROCESSING (JPG to Transparent Gold) ────────────────
    function processAllLogos() {
        const logoImages = document.querySelectorAll('.logo-gold-processed');
        if (logoImages.length === 0) return;

        const img = new Image();
        img.src = 'assets/logo.jpg';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Remove black background & tint white parts to premium gold gradient colors
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                
                const brightness = (r + g + b) / 3;

                if (brightness < 45) {
                    data[i+3] = 0;
                } else {
                    const factor = brightness / 255;
                    data[i] = Math.round(230 * factor);
                    data[i+1] = Math.round(190 * factor);
                    data[i+2] = Math.round(70 * factor);
                    data[i+3] = brightness;
                }
            }
            ctx.putImageData(imgData, 0, 0);

            const processedUrl = canvas.toDataURL();
            logoImages.forEach(targetImg => {
                targetImg.src = processedUrl;
            });
        };
    }

    processAllLogos();


    // ─── REAL STEAM OPENID LOGIN FLOW ───────────────────
    const authContainer = document.getElementById('auth-container');
    const authContainerMobile = document.getElementById('auth-container-mobile');

    function redirectToSteam() {
        if (window.location.protocol === 'file:') {
            showToast('Steam OpenID работает только через запущенный сервер (http). Откройте сайт через http://localhost:3000', false);
            return;
        }
        window.location.href = '/api/auth/steam';
    }

    // Render Logged In state in DOM
    function renderUser(username, avatarUrl) {
        // Accessibility: div with role="button" and tabindex="0" + aria properties
        const profileHtml = `
            <div class="user-profile-widget" id="user-profile-widget" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false" aria-label="Профиль игрока">
                <img src="${avatarUrl}" alt="Avatar" class="user-avatar">
                <span class="user-name">${username}</span>
                <span class="user-dropdown-arrow">▼</span>
                <div class="user-dropdown-menu">
                    <button class="user-dropdown-item" id="open-profile-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>Профиль</span>
                    </button>
                    <button class="user-dropdown-item" id="steam-logout-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        <span>Выйти</span>
                    </button>
                </div>
            </div>
        `;

        if (authContainer) authContainer.innerHTML = profileHtml;
        if (authContainerMobile) {
            authContainerMobile.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;">
                    <img src="${avatarUrl}" alt="Avatar" class="user-avatar" style="width: 48px; height: 48px;">
                    <span class="user-name" style="font-size: 1.1rem;">${username}</span>
                    <button class="steam-btn steam-btn--mobile" id="open-profile-btn-mobile" style="margin-top: var(--space-8); background: rgba(255, 255, 255, 0.05); border-color: var(--border-light); width: 100%;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Профиль
                    </button>
                    <button class="steam-btn steam-btn--mobile" id="steam-logout-btn-mobile" style="margin-top: 4px; background: #962525; border-color: rgba(255,0,0,0.2); width: 100%;">Выйти</button>
                </div>
            `;
        }

        // Attach logout event listeners
        const attachLogout = (btnId) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    logoutUser();
                });
            }
        };
        attachLogout('steam-logout-btn');
        attachLogout('steam-logout-btn-mobile');

        // Attach Profile listeners
        const attachProfile = (btnId) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const modal = document.getElementById('profile-modal-overlay');
                    if (modal) {
                        document.getElementById('profile-modal-avatar').src = avatarUrl;
                        document.getElementById('profile-modal-username').textContent = username;
                        modal.classList.add('open');
                    }
                    if (overlay && overlay.classList.contains('open')) toggleMobile();
                });
            }
        };
        attachProfile('open-profile-btn');
        attachProfile('open-profile-btn-mobile');

        // Dynamic keyboard interactions on widget
        const widget = document.getElementById('user-profile-widget');
        if (widget) {
            widget.addEventListener('click', () => {
                const expanded = widget.getAttribute('aria-expanded') === 'true';
                widget.setAttribute('aria-expanded', !expanded);
            });
            widget.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    widget.click();
                }
            });
            document.addEventListener('click', (e) => {
                if (!widget.contains(e.target)) {
                    widget.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Re-bind interactive sound effects for new elements
        bindInteractiveSounds();
    }

    function checkOpenIdCallback() {
        const params = new URLSearchParams(window.location.search);
        const claimedId = params.get('openid.claimed_id');
        if (claimedId) {
            const parts = claimedId.split('/id/');
            const steamId = parts[parts.length - 1];
            if (steamId) {
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
                
                const shortSteamId = 'ID: ' + steamId.slice(-6);
                const defaultAvatar = 'https://ui-avatars.com/api/?name=Player&background=1c1c1f&color=D4AF37&bold=true';
                
                localStorage.setItem('steam_username', shortSteamId);
                localStorage.setItem('steam_avatar', defaultAvatar);
                
                renderUser(shortSteamId, defaultAvatar);
                showToast(`Успешный вход! ${shortSteamId}`);
            }
        }
    }

    async function restoreSession() {
        if (window.location.protocol !== 'file:') {
            try {
                const res = await fetch('/api/auth/user');
                const data = await res.json();
                if (data.authenticated && data.user) {
                    localStorage.setItem('steam_username', data.user.name);
                    localStorage.setItem('steam_avatar', data.user.avatar);
                    renderUser(data.user.name, data.user.avatar);
                    return;
                }
            } catch (e) {
                console.error("Auth check failed:", e);
            }
        }
        
        // Fallback to local storage
        const username = localStorage.getItem('steam_username');
        const avatar = localStorage.getItem('steam_avatar');
        if (username && avatar) {
            renderUser(username, avatar);
        } else {
            resetAuthContainer();
        }
    }

    function resetAuthContainer() {
        const buttonHtml = `
            <button class="steam-btn" id="steam-login-btn">
                <img src="assets/steam.png" alt="Steam" width="18" height="18">
                <span>Войти</span>
            </button>
        `;
        if (authContainer) {
            authContainer.innerHTML = buttonHtml;
            document.getElementById('steam-login-btn').addEventListener('click', redirectToSteam);
        }
        if (authContainerMobile) {
            authContainerMobile.innerHTML = `
                <button class="steam-btn steam-btn--mobile" id="steam-login-btn-mobile">
                    <img src="assets/steam.png" alt="Steam" width="20" height="20">
                    <span>Войти через Steam</span>
                </button>
            `;
            document.getElementById('steam-login-btn-mobile').addEventListener('click', redirectToSteam);
        }
        bindInteractiveSounds();
    }

    function logoutUser() {
        localStorage.removeItem('steam_username');
        localStorage.removeItem('steam_avatar');
        resetAuthContainer();
        showToast('Вы вышли из аккаунта.');
    }

    checkOpenIdCallback();
    restoreSession();
    
    // Profile Modal Close logic & Escape Key Close
    const profileModalOverlay = document.getElementById('profile-modal-overlay');
    const profileModalClose = document.getElementById('profile-modal-close');
    
    if (profileModalClose) {
        profileModalClose.addEventListener('click', () => {
            if (profileModalOverlay) profileModalOverlay.classList.remove('open');
        });
    }
    
    if (profileModalOverlay) {
        profileModalOverlay.addEventListener('click', (e) => {
            if (e.target === profileModalOverlay) profileModalOverlay.classList.remove('open');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (profileModalOverlay && profileModalOverlay.classList.contains('open')) {
                profileModalOverlay.classList.remove('open');
                AudioController.playTick();
            }
        }
    });


    // ─── Hero Visual Parallax/Interactive (Fixed HUD Rotation Conflict) ─
    const heroVisual = document.getElementById('hero-interactive-visual');
    if (heroVisual) {
        const logo = document.getElementById('logo-tilt-container');
        const hudSvg = heroVisual.querySelector('.hud-svg');
        const glowBg = heroVisual.querySelector('.visual-glow-background');

        document.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx;
            const dy = (e.clientY - cy) / cy;

            // 3D tilt on the logo container (no keyframe conflict)
            if (logo) {
                logo.style.transform = `translate3d(${dx * 16}px, ${dy * 16}px, 0) rotateX(${dy * -12}deg) rotateY(${dx * 12}deg)`;
            }
            
            // Parallax shift on the SVG rings (opposite direction for depth)
            if (hudSvg) {
                hudSvg.style.transform = `translate3d(${dx * -10}px, ${dy * -10}px, 0)`;
            }

            // Parallax shift on the radial background glow
            if (glowBg) {
                glowBg.style.transform = `translate3d(calc(-50% + ${dx * -22}px), calc(-50% + ${dy * -22}px), 0)`;
            }
        });

        // Dynamic Live Ping simulation
        const pingEl = document.getElementById('hud-val-ping');
        if (pingEl) {
            setInterval(() => {
                const randPing = Math.floor(Math.random() * 5) + 11; // 11 to 15
                pingEl.textContent = `PING: ${randPing}MS`;
            }, 3500);
        }

        // Click reboot animation
        let isRebooting = false;
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isRebooting) return;
                isRebooting = true;
                
                // Play audio cue
                AudioController.playSuccess();
                
                // Add rebooting class for CSS animations
                heroVisual.classList.add('hud-rebooting');
                
                // Simulate terminal text glitch/reboot on data boxes
                const originalTexts = {
                    sys: document.getElementById('hud-val-sys').innerHTML,
                    ping: document.getElementById('hud-val-ping').textContent,
                    tick: document.getElementById('hud-val-tick').textContent,
                    loc: document.getElementById('hud-val-loc').textContent
                };

                // Temp glitch text
                document.getElementById('hud-val-sys').textContent = "SYS: ERR_REBOOT";
                document.getElementById('hud-val-ping').textContent = "PING: --";
                document.getElementById('hud-val-tick').textContent = "TICK: CALIBRATING";
                document.getElementById('hud-val-loc').textContent = "LOC: --";

                setTimeout(() => {
                    // Restore original
                    document.getElementById('hud-val-sys').innerHTML = originalTexts.sys;
                    document.getElementById('hud-val-ping').textContent = originalTexts.ping;
                    document.getElementById('hud-val-tick').textContent = originalTexts.tick;
                    document.getElementById('hud-val-loc').textContent = originalTexts.loc;
                    
                    heroVisual.classList.remove('hud-rebooting');
                    isRebooting = false;
                }, 1000);
            });
        }
    }


    // ─── Feature Card Glow Tracking (translate3d Reflow optimization) ─
    document.querySelectorAll('.feat-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
        });
    });


    // ─── Scroll Reveal ──────────────────────────────────
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));


    // ─── Stat Counter Animation ─────────────────────────
    const statNumbers = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'), 10);
                const suffix = el.getAttribute('data-suffix') || '';
                animateCounter(el, target, suffix);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    function animateCounter(el, target, suffix) {
        const duration = 1800;
        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(eased * target);
            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function switchTab(targetId) {
        if (!targetId) return;

        // Remove active class from all tabs
        tabViews.forEach(view => {
            if (view.id === targetId) {
                view.classList.add('active');
                view.style.display = 'block';
            } else {
                view.classList.remove('active');
                view.style.display = 'none';
            }
        });

        // Add 'home-active' class to body if home tab is active
        document.body.classList.toggle('home-active', targetId === 'home-view');

        // Update navbar active classes
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + targetId.replace('-view', '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // =====================================================
    // SPA HASH ROUTER
    // =====================================================
    const tabViews = document.querySelectorAll('.tab-view');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    function handleRouting() {
        let hash = window.location.hash || '#home';
        if (hash === '#hero' || hash === '#features' || hash === '#stats' || hash === '#connect') {
            hash = '#home'; // Map legacy anchor scroll targets back to home view
        }
        
        const viewId = hash.substring(1) + '-view';
        const activeView = document.getElementById(viewId);
        
        if (!activeView) return;
        
        // Hide all views
        tabViews.forEach(view => {
            view.classList.remove('active');
        });
        
        // Show active view
        activeView.classList.add('active');
        
        // Update navbar active classes
        navLinks.forEach(link => {
            const linkHash = link.getAttribute('href');
            if (linkHash === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Close mobile overlay if open
        if (overlay && overlay.classList.contains('open')) {
            toggleMobile();
        }

        // Scroll to top of window
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Rebind hover sound effects for new elements
        bindInteractiveSounds();
    }

    window.addEventListener('hashchange', handleRouting);
    // Initial route check
    if (window.location.hash) {
        handleRouting();
    }


    // =====================================================
    // MOCK DATA GENERATION
    // =====================================================
    const MOCK_AVATARS = [
        "https://ui-avatars.com/api/?name=User&background=1c1c1f&color=D4AF37&bold=true",
        "https://ui-avatars.com/api/?name=Pro&background=1c1c1f&color=D4AF37&bold=true",
        "https://ui-avatars.com/api/?name=VIP&background=1c1c1f&color=D4AF37&bold=true",
        "https://ui-avatars.com/api/?name=Admin&background=1c1c1f&color=D4AF37&bold=true",
        "https://ui-avatars.com/api/?name=Player&background=1c1c1f&color=D4AF37&bold=true"
    ];

    const MOCK_NAMES = [
        "✪ s1mple", "ZywOo", "m0NESY", "donk", "Maniac Hunter", "Ilya_Cheb", "Antigravity_AI",
        "Sniper_CS", "Bloody_Mary", "Ghost_Killer", "Silent_Assassin", "VIP_Gamer", "CS2_Fanatic",
        "Maniac_Buster", "ScreaM_tap", "GeT_RiGhT", "f0rest_fan", "NiKo_one", "apEX_hype", "shoxie"
    ];

    const MOCK_REASONS = [
        "Оскорбление игроков", "Использование читов (Wallhack)", "Аимбот детект",
        "Флуд/Спам в микрофон", "Помеха игровому процессу", "Обход бана",
        "Неадекватное поведение", "Мониторинг позиций", "Реклама сторонних сайтов"
    ];

    let leaderboardPlayers = [];
    async function loadLeaderboardData() {
        try {
            if (window.location.protocol !== 'file:') {
                const res = await fetch('/api/stats');
                if (res.ok) {
                    leaderboardPlayers = await res.json();
                }
            } else {
                console.warn("Running locally without server, mock stats not generated.");
            }
        } catch (e) {
            console.error('API Error:', e);
        }
        
        // Initial render after loading
        renderLeaderboard();
    }
    loadLeaderboardData();

    // Generate 30 Bans/Mutes
    const banList = [];
    const now = new Date();
    for (let i = 1; i <= 30; i++) {
        const type = Math.random() > 0.4 ? "ban" : "mute";
        const date = new Date(now.getTime() - i * 4 * 3600 * 1000); // offset hours
        const active = i <= 5; // First 5 are active
        const duration = Math.random() > 0.5 ? "1 день" : (Math.random() > 0.5 ? "7 дней" : "Навсегда");
        
        banList.push({
            type: type,
            player: MOCK_NAMES[(i + 3) % MOCK_NAMES.length],
            avatar: MOCK_AVATARS[(i + 1) % MOCK_AVATARS.length],
            steamId: "STEAM_1:1:" + (87654321 - i * 111),
            admin: "Admin_" + MOCK_NAMES[(i + 8) % MOCK_NAMES.length].split(" ")[0],
            reason: MOCK_REASONS[i % MOCK_REASONS.length],
            date: date.toLocaleDateString('ru-RU') + " " + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            duration: duration,
            active: active
        });
    }

    // Generate 10 Clans
    const clanList = [
        { rank: 1, name: "Most Valuable Players", tag: "MVP", owner: "m0NESY", members: "18/20", level: 12, points: 28400 },
        { rank: 2, name: "One Take Elite", tag: "ONE", owner: "ZywOo", members: "15/20", level: 9, points: 19340 },
        { rank: 3, name: "Wolf Pack", tag: "WOLF", owner: "✪ s1mple", members: "20/20", level: 10, points: 18120 },
        { rank: 4, name: "Hell Raisers", tag: "HELL", owner: "donk", members: "12/15", level: 8, points: 14500 },
        { rank: 5, name: "Silent Assassins", tag: "KILL", owner: "Silent_Assassin", members: "14/15", level: 7, points: 12100 },
        { rank: 6, name: "Cheboksary Esports", tag: "CHEB", owner: "Ilya_Cheb", members: "8/10", level: 5, points: 9800 },
        { rank: 7, name: "AI Overlords", tag: "AI", owner: "Antigravity_AI", members: "5/10", level: 4, points: 7200 },
        { rank: 8, name: "VIP Squad", tag: "VIP", owner: "VIP_Gamer", members: "9/15", level: 4, points: 6100 },
        { rank: 9, name: "CS2 Hunters", tag: "CS2", owner: "Maniac Hunter", members: "11/15", level: 3, points: 4300 },
        { rank: 10, name: "Ghost Riders", tag: "GHO", owner: "Ghost_Killer", members: "6/10", level: 2, points: 2800 }
    ];

    // Skins Catalog
    const skinsCatalog = [
        { id: "skin-1", title: "Maniac Jason (Premium)", category: "maniac", price: 350, rarity: "immortal", img: "assets/logo.jpg" },
        { id: "skin-2", title: "Maniac Myers", category: "maniac", price: 250, rarity: "legendary", img: "assets/logo.jpg" },
        { id: "skin-3", title: "Scream Ghostface", category: "maniac", price: 200, rarity: "cover", img: "assets/logo.jpg" },
        { id: "skin-4", title: "Zombie Butcher", category: "maniac", price: 150, rarity: "common", img: "assets/logo.jpg" },
        { id: "skin-5", title: "Survivor Lara Croft", category: "survivor", price: 200, rarity: "legendary", img: "assets/logo.jpg" },
        { id: "skin-6", title: "Survivor Leon Kennedy", category: "survivor", price: 180, rarity: "cover", img: "assets/logo.jpg" },
        { id: "skin-7", title: "Special Agent Ava", category: "survivor", price: 120, rarity: "epic", img: "assets/logo.jpg" },
        { id: "skin-8", title: "Survivor Hypebeast", category: "survivor", price: 90, rarity: "common", img: "assets/logo.jpg" },
        { id: "skin-9", title: "Bayonet Lore (Gold)", category: "weapon", price: 400, rarity: "immortal", img: "assets/logo.jpg" },
        { id: "skin-10", title: "Karambit Fade", category: "weapon", price: 300, rarity: "legendary", img: "assets/logo.jpg" },
        { id: "skin-11", title: "Butterfly Crimson Web", category: "weapon", price: 280, rarity: "cover", img: "assets/logo.jpg" },
        { id: "skin-12", title: "M9 Bayonet Doppler", category: "weapon", price: 240, rarity: "epic", img: "assets/logo.jpg" }
    ];


    // =====================================================
    // LEADERBOARD RENDERING & FILTERING
    // =====================================================
    const leaderboardTbody = document.getElementById('leaderboard-tbody');
    const leaderboardSearchInput = document.getElementById('leaderboard-search');
    const leaderboardPrevBtn = document.getElementById('leaderboard-prev-btn');
    const leaderboardNextBtn = document.getElementById('leaderboard-next-btn');
    const leaderboardPageNum = document.getElementById('leaderboard-page-num');
    const leaderboardShownCount = document.getElementById('leaderboard-shown-count');
    const leaderboardTotalCount = document.getElementById('leaderboard-total-count');

    let leaderboardCurrentPage = 1;
    const itemsPerPage = 10;
    let filteredLeaderboard = [...leaderboardPlayers];

    function renderLeaderboard() {
        if (!leaderboardTbody) return;
        leaderboardTbody.innerHTML = '';
        
        const startIndex = (leaderboardCurrentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredLeaderboard.length);
        const pageItems = filteredLeaderboard.slice(startIndex, endIndex);

        leaderboardShownCount.textContent = filteredLeaderboard.length === 0 ? 0 : pageItems.length;
        leaderboardTotalCount.textContent = filteredLeaderboard.length;
        leaderboardPageNum.textContent = `Страница ${leaderboardCurrentPage}`;

        if (pageItems.length === 0) {
            leaderboardTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: var(--space-32);">Игроки не найдены</td></tr>`;
            return;
        }

        pageItems.forEach(player => {
            const row = document.createElement('tr');
            row.className = `rank-${player.rank}`;
            
            const clanTagHtml = player.clanTag ? `<span class="table-clan-tag">[${player.clanTag}]</span>` : '';
            const statusHtml = player.online 
                ? `<span class="status-indicator online"><span class="status-dot"></span>В сети</span>`
                : `<span class="status-indicator offline"><span class="status-dot"></span>Не в сети</span>`;

            row.innerHTML = `
                <td><span class="rank-badge">${player.rank}</span></td>
                <td>
                    <div class="table-user-cell">
                        <img src="${player.avatar}" alt="" class="table-user-avatar">
                        <span class="table-user-name" data-username="${player.name}" data-avatar="${player.avatar}">${clanTagHtml}${player.name}</span>
                    </div>
                </td>
                <td><strong>${player.kills.toLocaleString()}</strong></td>
                <td>${player.deaths.toLocaleString()}</td>
                <td>${player.hsPercent}%</td>
                <td>${player.playtime} ч</td>
                <td>${statusHtml}</td>
            `;

            // Click listener for Player Profile Modal
            row.querySelector('.table-user-name').addEventListener('click', () => {
                openPlayerProfileModal(player.name, player.avatar, player.kills, player.deaths, player.playtime, player.rank);
            });

            leaderboardTbody.appendChild(row);
        });

        // Update button states
        leaderboardPrevBtn.disabled = leaderboardCurrentPage === 1;
        leaderboardNextBtn.disabled = endIndex >= filteredLeaderboard.length;
    }

    function openPlayerProfileModal(username, avatarUrl, kills, deaths, playtime, rank) {
        const modal = document.getElementById('profile-modal-overlay');
        if (modal) {
            document.getElementById('profile-modal-avatar').src = avatarUrl;
            document.getElementById('profile-modal-username').textContent = username;
            
            // Set stats values
            const statBoxes = modal.querySelectorAll('.p-stat-value');
            if (statBoxes.length >= 4) {
                statBoxes[0].textContent = kills.toLocaleString();
                statBoxes[1].textContent = deaths.toLocaleString();
                statBoxes[2].textContent = playtime + ' ч';
                statBoxes[3].textContent = '#' + rank;
            }
            modal.classList.add('open');
            AudioController.playSuccess();
        }
    }

    if (leaderboardSearchInput) {
        leaderboardSearchInput.addEventListener('input', () => {
            const query = leaderboardSearchInput.value.toLowerCase().trim();
            filteredLeaderboard = leaderboardPlayers.filter(player => 
                player.name.toLowerCase().includes(query) || player.steamId.toLowerCase().includes(query)
            );
            leaderboardCurrentPage = 1;
            renderLeaderboard();
        });
    }

    if (leaderboardPrevBtn) {
        leaderboardPrevBtn.addEventListener('click', () => {
            if (leaderboardCurrentPage > 1) {
                leaderboardCurrentPage--;
                renderLeaderboard();
                AudioController.playTick();
            }
        });
    }

    if (leaderboardNextBtn) {
        leaderboardNextBtn.addEventListener('click', () => {
            if ((leaderboardCurrentPage * itemsPerPage) < filteredLeaderboard.length) {
                leaderboardCurrentPage++;
                renderLeaderboard();
                AudioController.playTick();
            }
        });
    }

    // Initial render is now handled in loadLeaderboardData()


    // =====================================================
    // BANS RENDERING & FILTERING
    // =====================================================
    const bansTbody = document.getElementById('bans-tbody');
    const bansSearchInput = document.getElementById('bans-search');
    const bansPrevBtn = document.getElementById('bans-prev-btn');
    const bansNextBtn = document.getElementById('bans-next-btn');
    const bansPageNum = document.getElementById('bans-page-num');
    const filterButtons = document.querySelectorAll('#bans-filter-group .btn-filter');

    let bansCurrentPage = 1;
    let bansFilterType = 'all'; // all, ban, mute
    let filteredBans = [...banList];

    function applyBansFilters() {
        const query = bansSearchInput ? bansSearchInput.value.toLowerCase().trim() : '';
        filteredBans = banList.filter(ban => {
            const matchesQuery = ban.player.toLowerCase().includes(query) || 
                                 ban.steamId.toLowerCase().includes(query) ||
                                 ban.admin.toLowerCase().includes(query);
            
            const matchesType = bansFilterType === 'all' || ban.type === bansFilterType;
            return matchesQuery && matchesType;
        });
        bansCurrentPage = 1;
        renderBans();
    }

    function renderBans() {
        if (!bansTbody) return;
        bansTbody.innerHTML = '';

        const startIndex = (bansCurrentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredBans.length);
        const pageItems = filteredBans.slice(startIndex, endIndex);

        bansPageNum.textContent = `Страница ${bansCurrentPage}`;

        if (pageItems.length === 0) {
            bansTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: var(--space-32);">Записи не найдены</td></tr>`;
            return;
        }

        pageItems.forEach(ban => {
            const row = document.createElement('tr');
            
            const typeBadge = ban.type === 'ban' 
                ? `<span class="ban-badge ban">Бан</span>`
                : `<span class="ban-badge mute">Мут</span>`;
                
            const statusHtml = ban.active 
                ? `<span class="ban-status active">Активен</span>`
                : `<span class="ban-status expired">Истек</span>`;

            row.innerHTML = `
                <td>${typeBadge}</td>
                <td>
                    <div class="table-user-cell">
                        <img src="${ban.avatar}" alt="" class="table-user-avatar">
                        <div>
                            <div class="table-user-name" style="cursor: default;">${ban.player}</div>
                            <div style="font-size: 0.72rem; color: var(--text-muted); font-family: monospace;">${ban.steamId}</div>
                        </div>
                    </div>
                </td>
                <td><span style="font-weight: 600;">${ban.admin}</span></td>
                <td><span style="color: var(--text-secondary);">${ban.reason}</span></td>
                <td>${ban.date}</td>
                <td>${ban.duration}</td>
                <td>${statusHtml}</td>
            `;

            bansTbody.appendChild(row);
        });

        bansPrevBtn.disabled = bansCurrentPage === 1;
        bansNextBtn.disabled = endIndex >= filteredBans.length;
    }

    if (bansSearchInput) {
        bansSearchInput.addEventListener('input', applyBansFilters);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bansFilterType = btn.getAttribute('data-filter');
            applyBansFilters();
            AudioController.playTick();
        });
    });

    if (bansPrevBtn) {
        bansPrevBtn.addEventListener('click', () => {
            if (bansCurrentPage > 1) {
                bansCurrentPage--;
                renderBans();
                AudioController.playTick();
            }
        });
    }

    if (bansNextBtn) {
        bansNextBtn.addEventListener('click', () => {
            if ((bansCurrentPage * itemsPerPage) < filteredBans.length) {
                bansCurrentPage++;
                renderBans();
                AudioController.playTick();
            }
        });
    }

    // Initial render
    renderBans();


    // =====================================================
    // CLANS RENDERING
    // =====================================================
    const clansTbody = document.getElementById('clans-tbody');

    function renderClans() {
        if (!clansTbody) return;
        clansTbody.innerHTML = '';

        clanList.forEach(clan => {
            const row = document.createElement('tr');
            row.className = `rank-${clan.rank}`;

            row.innerHTML = `
                <td><span class="rank-badge">${clan.rank}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="table-clan-tag" style="background: rgba(212, 175, 55, 0.1); border-color: var(--border-gold); font-size: 0.8rem; padding: 2px 6px;">[${clan.tag}]</span>
                        <span style="font-weight: 700; color: var(--white);">${clan.name}</span>
                    </div>
                </td>
                <td><span style="font-weight: 600;">${clan.owner}</span></td>
                <td>${clan.members}</td>
                <td><span style="font-weight: 700; font-family: var(--font-display);">${clan.level} lvl</span></td>
                <td><strong class="text-gold" style="font-family: var(--font-display); font-size: 1.05rem;">${clan.points.toLocaleString()} PTS</strong></td>
            `;

            clansTbody.appendChild(row);
        });
    }

    renderClans();


    // =====================================================
    // SKINS CATALOG RENDERING & FILTERING
    // =====================================================
    const skinsGrid = document.getElementById('skins-grid');
    const skinsFilters = document.querySelectorAll('#skins-filters .btn-catalog-filter');

    let activeSkinsFilter = 'all';

    function renderSkins() {
        if (!skinsGrid) return;
        skinsGrid.innerHTML = '';

        const items = activeSkinsFilter === 'all'
            ? skinsCatalog
            : skinsCatalog.filter(skin => skin.category === activeSkinsFilter);

        if (items.length === 0) {
            skinsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: var(--space-48);">Скины в данной категории отсутствуют.</div>`;
            return;
        }

        items.forEach(skin => {
            const card = document.createElement('div');
            card.className = 'skin-card reveal';
            
            let rarityBadge = '';
            let rarityBarClass = '';
            
            switch(skin.rarity) {
                case 'immortal':
                    rarityBadge = `<span class="privilege-badge red">Immortal</span>`;
                    rarityBarClass = 'rarity-immortal';
                    break;
                case 'legendary':
                    rarityBadge = `<span class="privilege-badge gold">Legendary</span>`;
                    rarityBarClass = 'rarity-legendary';
                    break;
                case 'cover':
                    rarityBadge = `<span class="privilege-badge purple">Epic</span>`;
                    rarityBarClass = 'rarity-cover';
                    break;
                default:
                    rarityBadge = `<span class="privilege-badge">Common</span>`;
                    rarityBarClass = 'rarity-common';
            }

            const cleanCategory = skin.category === 'maniac' ? 'Для Маньяка' : (skin.category === 'survivor' ? 'Для Выжившего' : 'Скин оружия');

            card.innerHTML = `
                <div class="skin-card-preview">
                    <img src="${skin.img}" alt="${skin.title}" class="skin-card-img logo-gold-processed">
                    <div class="skin-card-rarity ${rarityBarClass}"></div>
                </div>
                <div class="skin-card-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <span class="skin-card-tag">${cleanCategory}</span>
                        ${rarityBadge}
                    </div>
                    <h4 class="skin-card-title">${skin.title}</h4>
                    <div class="skin-card-footer">
                        <span class="skin-card-price">${skin.price} ₽</span>
                        <button type="button" class="btn-buy-skin" data-skin-name="${skin.title}" data-skin-price="${skin.price}">Купить</button>
                    </div>
                </div>
            `;

            // Redirect to store on buy click
            card.querySelector('.btn-buy-skin').addEventListener('click', () => {
                selectSkinForPurchase(skin.id, skin.title, skin.price);
            });

            skinsGrid.appendChild(card);
        });

        // Trigger logo post-process for skin avatars
        processAllLogos();
        bindInteractiveSounds();
    }

    skinsFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            skinsFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSkinsFilter = btn.getAttribute('data-catalog-filter');
            renderSkins();
            AudioController.playTick();
        });
    });

    function selectSkinForPurchase(skinId, title, price) {
        window.location.hash = '#store';
        
        // Remove selections from cards
        document.querySelectorAll('.privilege-card').forEach(c => c.classList.remove('selected'));
        
        // Populate form summary with Custom Skin info
        selectedPrivilege = {
            id: skinId,
            name: `Скин: ${title}`,
            price: price
        };

        updateCheckoutSummary();
        showToast(`Выбран скин: ${title}. Заполните данные.`);
    }

    renderSkins();


    // =====================================================
    // STORE CHECKOUT & PROMO CODE LOGIC
    // =====================================================
    const privilegeCards = document.querySelectorAll('.privilege-card');
    const steamIdInput = document.getElementById('checkout-steam-id');
    const promoInput = document.getElementById('checkout-promo');
    const btnApplyPromo = document.getElementById('btn-apply-promo');
    const btnUseAuth = document.getElementById('btn-use-authorized');
    const checkoutSubmitBtn = document.getElementById('checkout-submit-btn');
    const gatewayOptions = document.querySelectorAll('.gateway-option');
    const checkoutForm = document.getElementById('checkout-form');

    let selectedPrivilege = null;
    let appliedDiscount = 0; // percentage
    let selectedGateway = 'sbp';

    function updateCheckoutSummary() {
        const nameEl = document.getElementById('summary-privilege-name');
        const basePriceEl = document.getElementById('summary-base-price');
        const discountRow = document.querySelector('.discount-row');
        const discountValueEl = document.getElementById('summary-discount-value');
        const totalPriceEl = document.getElementById('summary-total-price');

        if (!selectedPrivilege) {
            nameEl.textContent = 'Не выбрано';
            basePriceEl.textContent = '0 ₽';
            discountRow.style.display = 'none';
            totalPriceEl.textContent = '0 ₽';
            checkoutSubmitBtn.disabled = true;
            return;
        }

        nameEl.textContent = selectedPrivilege.name;
        basePriceEl.textContent = `${selectedPrivilege.price} ₽`;

        if (appliedDiscount > 0) {
            discountRow.style.display = 'flex';
            discountValueEl.textContent = `-${appliedDiscount}%`;
            const discountedPrice = Math.round(selectedPrivilege.price * (1 - appliedDiscount / 100));
            totalPriceEl.textContent = `${discountedPrice} ₽`;
        } else {
            discountRow.style.display = 'none';
            totalPriceEl.textContent = `${selectedPrivilege.price} ₽`;
        }

        // Enable button if steam ID filled
        checkoutSubmitBtn.disabled = !steamIdInput.value.trim();
    }

    let selectedDurationDays = 30; // default to 30 days
    const globalDurationBtns = document.querySelectorAll('.global-duration-btn');

    function updateCardPrices() {
        privilegeCards.forEach(card => {
            const privilegeId = card.getAttribute('data-privilege');
            const priceEl = card.querySelector('.privilege-price');
            
            // MVP only has lifetime option (2000)
            let priceAttr = `data-price-${selectedDurationDays}`;
            if (privilegeId === 'mvp') {
                priceAttr = 'data-price-0';
            }
            
            const price = parseInt(card.getAttribute(priceAttr), 10);
            card.setAttribute('data-price', price);
            
            if (priceEl) {
                priceEl.innerHTML = `${price} <span class="currency">₽</span>`;
            }

            // If this card is currently selected, update the checkout detail
            if (card.classList.contains('selected')) {
                const durationText = (privilegeId === 'mvp') ? 'Навсегда' : 
                                     (selectedDurationDays === 7 ? '7 дней' : 
                                     (selectedDurationDays === 30 ? '30 дней' : 'Навсегда'));
                
                selectedPrivilege = {
                    id: privilegeId,
                    name: `${card.querySelector('.privilege-title').textContent} (${durationText})`,
                    price: price
                };
                updateCheckoutSummary();
            }
        });
    }

    // Set up global duration toggle event listeners
    globalDurationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            globalDurationBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            selectedDurationDays = parseInt(btn.getAttribute('data-days'), 10);
            updateCardPrices();
            AudioController.playTick();
        });
    });

    privilegeCards.forEach(card => {
        const selectBtn = card.querySelector('.btn-select-privilege');
        if (selectBtn) {
            selectBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                privilegeCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const privilegeId = card.getAttribute('data-privilege');
                const durationText = (privilegeId === 'mvp') ? 'Навсегда' : 
                                     (selectedDurationDays === 7 ? '7 дней' : 
                                     (selectedDurationDays === 30 ? '30 дней' : 'Навсегда'));
                const price = parseInt(card.getAttribute('data-price'), 10);

                selectedPrivilege = {
                    id: privilegeId,
                    name: `${card.querySelector('.privilege-title').textContent} (${durationText})`,
                    price: price
                };

                updateCheckoutSummary();
                AudioController.playTick();
            });
        }
    });

    if (steamIdInput) {
        steamIdInput.addEventListener('input', () => {
            updateCheckoutSummary();
        });
    }

    if (btnUseAuth) {
        btnUseAuth.addEventListener('click', () => {
            const authUsername = localStorage.getItem('steam_username');
            if (authUsername) {
                steamIdInput.value = authUsername.replace('ID: ', '');
                updateCheckoutSummary();
                AudioController.playSuccess();
            } else {
                showToast('Войдите через Steam в шапке сайта', false);
            }
        });
    }

    if (btnApplyPromo) {
        btnApplyPromo.addEventListener('click', () => {
            const code = promoInput.value.trim().toUpperCase();
            if (!code) {
                appliedDiscount = 0;
                updateCheckoutSummary();
                return;
            }

            let disc = 0;
            if (code === 'MVP20') disc = 20;
            else if (code === 'LAOWAI') disc = 30;
            else if (code === 'CS2') disc = 10;

            if (disc > 0) {
                appliedDiscount = disc;
                showToast(`Промокод применен! Скидка ${disc}%`);
                AudioController.playSuccess();
            } else {
                appliedDiscount = 0;
                showToast('Неверный промокод', false);
            }
            updateCheckoutSummary();
        });
    }

    gatewayOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            gatewayOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            opt.querySelector('input').checked = true;
            selectedGateway = opt.querySelector('input').value;
            AudioController.playTick();
        });
    });

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!selectedPrivilege) return;

            const steamId = steamIdInput.value.trim();
            const promo = promoInput.value.trim();
            const total = document.getElementById('summary-total-price').textContent;

            showToast(`Формирование счета на ${total}...`);
            AudioController.playSuccess();

            setTimeout(() => {
                showToast(`Перенаправление на шлюз ${selectedGateway.toUpperCase()}...`);
                // Clear state
                privilegeCards.forEach(c => c.classList.remove('selected'));
                selectedPrivilege = null;
                steamIdInput.value = '';
                promoInput.value = '';
                appliedDiscount = 0;
                updateCheckoutSummary();
            }, 1200);
        });
    }


    // =====================================================
    // =====================================================
    // RULES TAB INTERACTIVITY
    // =====================================================
    const ruleTabBtns = document.querySelectorAll('.rules-tab-btn');
    const rulePanes = document.querySelectorAll('.rule-pane');

    ruleTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            ruleTabBtns.forEach(b => b.classList.remove('active'));
            rulePanes.forEach(p => p.classList.remove('active'));
            
            // Add active to current
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-rule-target');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
            AudioController.playTick();
        });
    });


    // =====================================================
    // LIVE CHAT PANEL SIDEBAR
    // =====================================================
    const chatDrawer = document.getElementById('chat-drawer');
    const openChatBtn = document.getElementById('floating-chat-toggle');
    const closeChatBtn = document.getElementById('btn-close-chat');
    const chatMsgInput = document.getElementById('chat-message-input');
    const chatSendBtn = document.getElementById('btn-send-message');
    const chatMessagesContainer = document.getElementById('chat-messages-container');
    const chatEmojiTrigger = document.getElementById('chat-emoji-trigger');
    const chatEmojiPanel = document.getElementById('chat-emoji-panel');
    const chatBadgeDot = document.getElementById('chat-badge-dot');

    let socket;
    if (window.location.protocol !== 'file:') {
        socket = io();
    }
    function toggleChat(forceClose = false) {
        if (!chatDrawer) return;
        const isOpen = chatDrawer.classList.contains('open');
        if (isOpen || forceClose) {
            chatDrawer.classList.remove('open');
            chatDrawer.setAttribute('aria-hidden', 'true');
        } else {
            chatDrawer.classList.add('open');
            chatDrawer.setAttribute('aria-hidden', 'false');
            chatBadgeDot.style.display = 'none';
            // Autoscroll chat
            setTimeout(() => {
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }, 300);
            AudioController.playTick();
        }
    }

    if (openChatBtn) openChatBtn.addEventListener('click', () => toggleChat());
    if (closeChatBtn) closeChatBtn.addEventListener('click', () => toggleChat(true));

    function appendMessage(name, text, badge = '', avatarUrl = '', isUser = false) {
        if (!chatMessagesContainer) return;
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message';
        
        const displayAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1c1c1f&color=D4AF37&bold=true`;
        let badgeHtml = '';
        
        if (badge) {
            badgeHtml = `<span class="chat-msg-badge ${badge}">${badge}</span>`;
        }

        msgDiv.innerHTML = `
            <img src="${displayAvatar}" alt="" class="chat-msg-avatar">
            <div class="chat-msg-content" style="${isUser ? 'border-color: var(--border-gold);' : ''}">
                <div class="chat-msg-header">
                    <span class="chat-msg-username" style="${isUser ? 'color: var(--gold-200);' : ''}">${name}</span>
                    ${badgeHtml}
                </div>
                <div class="chat-msg-text">${text}</div>
                <span class="chat-msg-time">${timeStr}</span>
            </div>
        `;

        chatMessagesContainer.appendChild(msgDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // Socket.IO Events Listener
    if (socket) {
        socket.on('chatHistory', (messages) => {
            if (chatMessagesContainer) {
                chatMessagesContainer.innerHTML = '';
                messages.forEach(msg => {
                    appendMessage(msg.user, msg.text, msg.rank, msg.avatar);
                });
            }
        });

        socket.on('chatMessage', (msg) => {
            const isUser = msg.user === localStorage.getItem('steam_username');
            appendMessage(msg.user, msg.text, msg.rank, msg.avatar, isUser);
            
            // Notification dot if closed
            const isChatOpen = chatDrawer && chatDrawer.classList.contains('open');
            if (!isChatOpen && chatBadgeDot) {
                chatBadgeDot.style.display = 'block';
                AudioController.playTick(); // incoming msg sound
            }
        });
    }

    function handleSendUserMessage() {
        const text = chatMsgInput.value.trim();
        if (!text) return;
        
        const username = localStorage.getItem('steam_username');
        const avatar = localStorage.getItem('steam_avatar');

        if (!username) {
            showToast('Для общения в чате нужно войти через Steam!', false);
            return;
        }

        if (socket) {
            socket.emit('chatMessage', {
                user: username,
                avatar: avatar,
                text: text,
                rank: 'ИГРОК' // Заглушка, в будущем ранг будет браться из БД
            });
            chatMsgInput.value = '';
            AudioController.playTick();
        }
    }

    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', handleSendUserMessage);
    }
    
    if (chatMsgInput) {
        chatMsgInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendUserMessage();
            }
        });
    }

    // Emoji panel support
    if (chatEmojiTrigger && chatEmojiPanel) {
        chatEmojiTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const visible = chatEmojiPanel.style.display === 'grid';
            chatEmojiPanel.style.display = visible ? 'none' : 'grid';
        });

        document.addEventListener('click', () => {
            chatEmojiPanel.style.display = 'none';
        });

        chatEmojiPanel.querySelectorAll('.emoji-item').forEach(emoji => {
            emoji.addEventListener('click', () => {
                chatMsgInput.value += emoji.textContent;
                chatMsgInput.focus();
            });
        });
    }

    // Моковые боты чата удалены, работает реальный WebSocket.

    // =====================================================
    // SERVER PLAYERS MODAL & SEARCH
    // =====================================================
    const statItemOnline = document.getElementById('stat-4');
    const playersModal = document.getElementById('players-modal-overlay');
    const playersModalClose = document.getElementById('players-modal-close');
    const playersList = document.getElementById('modal-players-list');
    const playersSearchInput = document.getElementById('modal-players-search');

    const activePlayersMock = [
        { name: "✪ s1mple", score: 850, avatar: MOCK_AVATARS[0] },
        { name: "donk", score: 720, avatar: MOCK_AVATARS[1] },
        { name: "m0NESY", score: 680, avatar: MOCK_AVATARS[2] },
        { name: "Ilya_Cheb", score: 540, avatar: MOCK_AVATARS[3] },
        { name: "Maniac Hunter", score: 490, avatar: MOCK_AVATARS[4] },
        { name: "ZywOo", score: 410, avatar: MOCK_AVATARS[1] },
        { name: "Bloody_Mary", score: 320, avatar: MOCK_AVATARS[0] },
        { name: "Ghost_Killer", score: 280, avatar: MOCK_AVATARS[2] },
        { name: "Silent_Assassin", score: 210, avatar: MOCK_AVATARS[3] },
        { name: "CS2_Fanatic", score: 180, avatar: MOCK_AVATARS[4] },
        { name: "VIP_Gamer", score: 140, avatar: MOCK_AVATARS[1] },
        { name: "ScreaM_tap", score: 95, avatar: MOCK_AVATARS[0] }
    ];

    function togglePlayersModal(show = true) {
        if (!playersModal) return;
        if (show) {
            playersModal.classList.add('open');
            renderActivePlayers();
            AudioController.playSuccess();
        } else {
            playersModal.classList.remove('open');
        }
    }

    function renderActivePlayers() {
        if (!playersList) return;
        playersList.innerHTML = '';

        const query = playersSearchInput ? playersSearchInput.value.toLowerCase().trim() : '';
        const items = activePlayersMock.filter(player => player.name.toLowerCase().includes(query));

        if (items.length === 0) {
            playersList.innerHTML = `<li style="justify-content: center; color: var(--text-muted);">Игроки не найдены</li>`;
            return;
        }

        items.forEach(player => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="player-info-block">
                    <img src="${player.avatar}" alt="" class="player-list-avatar">
                    <span class="player-list-name">${player.name}</span>
                </div>
                <span class="player-list-score">${player.score} PTS</span>
            `;
            playersList.appendChild(li);
        });
    }

    if (statItemOnline) {
        statItemOnline.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlayersModal(true);
        });
    }

    if (playersModalClose) {
        playersModalClose.addEventListener('click', () => togglePlayersModal(false));
    }

    if (playersModal) {
        playersModal.addEventListener('click', (e) => {
            if (e.target === playersModal) togglePlayersModal(false);
        });
    }

    if (playersSearchInput) {
        playersSearchInput.addEventListener('input', renderActivePlayers);
    }


    // Global Escape Key listener overrides
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (playersModal && playersModal.classList.contains('open')) {
                togglePlayersModal(false);
                AudioController.playTick();
            }
            if (chatDrawer && chatDrawer.classList.contains('open')) {
                toggleChat(true);
                AudioController.playTick();
            }
        }
    });

});

