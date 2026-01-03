import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

// Import analytics for tracking
let trackEvent = () => { };
if (typeof window !== 'undefined' && window.require) {
    try {
        const path = window.require('path');
        const { app } = window.require('@electron/remote');
        const analyticsPath = path.join(app.getAppPath(), 'src', 'utils', 'analytics.js');
        const analytics = window.require(analyticsPath);
        trackEvent = analytics.trackEvent;
    } catch (error) {
        console.warn('[OnboardingView] Analytics not available:', error);
    }
}

export class OnboardingView extends LitElement {
    static styles = css`
        * {
            font-family:
                'Inter',
                -apple-system,
                BlinkMacSystemFont,
                'Segoe UI',
                Roboto,
                sans-serif;
            cursor: default;
            user-select: none;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :host {
            display: block;
            height: 100%;
            width: 100%;
            position: fixed;
            top: 0;
            left: 0;
            overflow: hidden;
        }

        .onboarding-container {
            position: relative;
            width: 100%;
            height: 100%;
            background: #0a0a0a;
            overflow: hidden;
        }

        .close-button {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 10;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: rgba(255, 255, 255, 0.6);
        }

        .close-button:hover {
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.9);
        }

        .close-button svg {
            width: 16px;
            height: 16px;
        }

        .gradient-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        }

        .content-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 60px;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 32px 48px;
            max-width: 500px;
            margin: 0 auto;
            color: #e5e5e5;
            overflow: hidden;
            text-align: center;
        }

        .slide-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 16px;
            opacity: 0.9;
            display: block;
        }

        .slide-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #ffffff;
            line-height: 1.3;
            text-align: center;
        }

        .slide-content {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 24px;
            color: #b8b8b8;
            font-weight: 400;
            text-align: center;
        }

        .context-textarea {
            width: 100%;
            height: 100px;
            padding: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            color: #e5e5e5;
            font-size: 14px;
            font-family: inherit;
            resize: vertical;
            transition: all 0.2s ease;
            margin-bottom: 24px;
        }

        .context-textarea::placeholder {
            color: rgba(255, 255, 255, 0.4);
            font-size: 14px;
        }

        .context-textarea:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.08);
        }

        /* Tailor dropdowns */
        .tailor-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 24px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            opacity: 0;
            transform: translateY(-10px);
            animation: fadeInUp 0.4s ease forwards;
        }

        .form-group:nth-child(1) {
            animation-delay: 0.1s;
        }

        .form-group:nth-child(2) {
            animation-delay: 0.2s;
        }

        .form-group:nth-child(3) {
            animation-delay: 0.3s;
        }

        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .form-label {
            font-size: 14px;
            font-weight: 500;
            color: #e5e5e5;
            text-align: left;
        }

        .form-select {
            width: 100%;
            padding: 12px 16px;
            background: rgba(60, 60, 60, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            color: #e5e5e5;
            font-size: 15px;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s ease;
            appearance: none;
            background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e');
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 16px;
            padding-right: 40px;
        }

        .form-select:hover {
            background: rgba(70, 70, 70, 0.7);
            border-color: rgba(255, 255, 255, 0.25);
        }

        .form-select:focus {
            outline: none;
            background: rgba(70, 70, 70, 0.8);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .form-select option {
            background: #2a2a2a;
            color: #e5e5e5;
            padding: 8px;
        }

        .feature-list {
            max-width: 100%;
            width: fit-content;
            margin: 0 auto;
            text-align: left;
        }

        .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 15px;
            color: #b8b8b8;
        }

        .feature-icon {
            font-size: 16px;
            margin-right: 12px;
            opacity: 0.8;
        }

        /* Sign-in slide styles - matching reference design */
        .auth-container {
            width: 100%;
            max-width: 380px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .auth-logo {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px rgba(250, 204, 21, 0.3);
        }

        .auth-logo svg {
            width: 40px;
            height: 40px;
            color: #1a1a1a;
        }

        .auth-title {
            font-size: 32px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 8px;
            text-align: center;
        }

        .auth-subtitle {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 32px;
            text-align: center;
        }

        .auth-buttons {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
        }

        .google-btn {
            width: 100%;
            background: rgba(60, 70, 80, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 14px 20px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.2s ease;
        }

        .google-btn:hover {
            background: rgba(70, 80, 90, 0.9);
            transform: translateY(-1px);
        }

        .google-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .google-btn svg {
            width: 20px;
            height: 20px;
        }

        .email-btn {
            width: 100%;
            background: linear-gradient(135deg, #facc15 0%, #d4a50a 100%);
            border: none;
            color: #1a1a1a;
            padding: 14px 20px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 16px rgba(250, 204, 21, 0.25);
        }

        .email-btn:hover {
            background: linear-gradient(135deg, #eab308 0%, #ca9a0a 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(250, 204, 21, 0.35);
        }

        .email-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .email-btn svg {
            width: 20px;
            height: 20px;
        }

        .auth-links {
            text-align: center;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 16px;
        }

        .auth-link {
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            text-decoration: none;
            background: none;
            border: none;
            font-size: inherit;
            font-family: inherit;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .auth-link:hover {
            color: white;
            text-decoration: underline;
        }

        .auth-legal {
            text-align: center;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
            line-height: 1.6;
        }

        .auth-legal a {
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
        }

        .auth-legal a:hover {
            color: white;
            text-decoration: underline;
        }

        .auth-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            margin-bottom: 16px;
            text-align: center;
            width: 100%;
        }

        .navigation {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            height: 60px;
            box-sizing: border-box;
        }

        .nav-button {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #e5e5e5;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 36px;
            min-height: 36px;
        }

        .nav-button:hover {
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .nav-button:active {
            transform: scale(0.98);
        }

        .nav-button:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .nav-button:disabled:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.1);
            transform: none;
        }

        .progress-dots {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .dot:hover {
            background: rgba(255, 255, 255, 0.4);
        }

        .dot.active {
            background: rgba(255, 255, 255, 0.8);
            transform: scale(1.2);
        }
    `;

    static properties = {
        currentSlide: { type: Number },
        contextText: { type: String },
        onComplete: { type: Function },
        onClose: { type: Function },
        // Auth properties
        authEmail: { type: String },
        authPassword: { type: String },
        authLoading: { type: Boolean },
        authError: { type: String },
        // Tailor properties
        outputLanguage: { type: String },
        programmingLanguage: { type: String },
        audioLanguage: { type: String },
    };

    constructor() {
        super();
        this.currentSlide = 0;
        this.contextText = '';
        this.onComplete = () => { };
        this.onClose = () => { };
        // Auth state
        this.authEmail = '';
        this.authPassword = '';
        this.authLoading = false;
        this.authError = '';
        // Tailor preferences
        this.outputLanguage = 'English';
        this.programmingLanguage = 'Python';
        this.audioLanguage = 'en';
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;

        // Transition properties
        this.isTransitioning = false;
        this.transitionStartTime = 0;
        this.transitionDuration = 800; // 800ms fade duration
        this.previousColorScheme = null;

        // Subtle dark color schemes for each slide (7 slides now)
        this.colorSchemes = [
            // Slide 0 - Sign In (Dark blue accent)
            [
                [15, 20, 35], // Dark blue
                [10, 15, 30], // Darker blue
                [20, 25, 40], // Slightly lighter
                [5, 10, 25], // Very dark blue
                [25, 30, 45], // Muted blue
                [5, 5, 15], // Almost black
            ],
            // Slide 1 - Welcome (Very dark purple/gray)
            [
                [25, 25, 35], // Dark gray-purple
                [20, 20, 30], // Darker gray
                [30, 25, 40], // Slightly purple
                [15, 15, 25], // Very dark
                [35, 30, 45], // Muted purple
                [10, 10, 20], // Almost black
            ],
            // Slide 2 - Privacy (Dark blue-gray)
            [
                [20, 25, 35], // Dark blue-gray
                [15, 20, 30], // Darker blue-gray
                [25, 30, 40], // Slightly blue
                [10, 15, 25], // Very dark blue
                [30, 35, 45], // Muted blue
                [5, 10, 20], // Almost black
            ],
            // Slide 3 - Tailor Your Co-Interviewer (Dark purple accent)
            [
                [30, 20, 35], // Dark purple
                [25, 15, 30], // Darker purple
                [35, 25, 40], // Slightly purple
                [20, 10, 25], // Very dark purple
                [40, 30, 45], // Muted purple
                [15, 5, 20], // Almost black
            ],
            // Slide 4 - Context (Dark neutral)
            [
                [25, 25, 25], // Neutral dark
                [20, 20, 20], // Darker neutral
                [30, 30, 30], // Light dark
                [15, 15, 15], // Very dark
                [35, 35, 35], // Lighter dark
                [10, 10, 10], // Almost black
            ],
            // Slide 5 - Features (Dark green-gray)
            [
                [20, 30, 25], // Dark green-gray
                [15, 25, 20], // Darker green-gray
                [25, 35, 30], // Slightly green
                [10, 20, 15], // Very dark green
                [30, 40, 35], // Muted green
                [5, 15, 10], // Almost black
            ],
            // Slide 6 - Complete (Dark warm gray)
            [
                [30, 25, 20], // Dark warm gray
                [25, 20, 15], // Darker warm
                [35, 30, 25], // Slightly warm
                [20, 15, 10], // Very dark warm
                [40, 35, 30], // Muted warm
                [15, 10, 5], // Almost black
            ],
        ];
    }

    firstUpdated() {
        this.canvas = this.shadowRoot.querySelector('.gradient-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.startGradientAnimation();

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const rect = this.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    startGradientAnimation() {
        if (!this.ctx) return;

        const animate = timestamp => {
            this.drawGradient(timestamp);
            this.animationId = requestAnimationFrame(animate);
        };

        animate(0);
    }

    drawGradient(timestamp) {
        if (!this.ctx || !this.canvas) return;

        const { width, height } = this.canvas;
        let colors = this.colorSchemes[this.currentSlide];

        // Handle color scheme transitions
        if (this.isTransitioning && this.previousColorScheme) {
            const elapsed = timestamp - this.transitionStartTime;
            const progress = Math.min(elapsed / this.transitionDuration, 1);

            // Use easing function for smoother transition
            const easedProgress = this.easeInOutCubic(progress);

            colors = this.interpolateColorSchemes(this.previousColorScheme, this.colorSchemes[this.currentSlide], easedProgress);

            // End transition when complete
            if (progress >= 1) {
                this.isTransitioning = false;
                this.previousColorScheme = null;
            }
        }

        const time = timestamp * 0.0005; // Much slower animation

        // Create moving gradient with subtle flow
        const flowX = Math.sin(time * 0.7) * width * 0.3;
        const flowY = Math.cos(time * 0.5) * height * 0.2;

        const gradient = this.ctx.createLinearGradient(flowX, flowY, width + flowX * 0.5, height + flowY * 0.5);

        // Very subtle color variations with movement
        colors.forEach((color, index) => {
            const offset = index / (colors.length - 1);
            const wave = Math.sin(time + index * 0.3) * 0.05; // Very subtle wave

            const r = Math.max(0, Math.min(255, color[0] + wave * 5));
            const g = Math.max(0, Math.min(255, color[1] + wave * 5));
            const b = Math.max(0, Math.min(255, color[2] + wave * 5));

            gradient.addColorStop(offset, `rgb(${r}, ${g}, ${b})`);
        });

        // Fill with moving gradient
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Add a second layer with radial gradient for more depth
        const centerX = width * 0.5 + Math.sin(time * 0.3) * width * 0.15;
        const centerY = height * 0.5 + Math.cos(time * 0.4) * height * 0.1;
        const radius = Math.max(width, height) * 0.8;

        const radialGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

        // Very subtle radial overlay
        radialGradient.addColorStop(0, `rgba(${colors[0][0] + 10}, ${colors[0][1] + 10}, ${colors[0][2] + 10}, 0.1)`);
        radialGradient.addColorStop(0.5, `rgba(${colors[2][0]}, ${colors[2][1]}, ${colors[2][2]}, 0.05)`);
        radialGradient.addColorStop(
            1,
            `rgba(${colors[colors.length - 1][0]}, ${colors[colors.length - 1][1]}, ${colors[colors.length - 1][2]}, 0.03)`
        );

        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.fillStyle = radialGradient;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.globalCompositeOperation = 'source-over';
    }

    nextSlide() {
        // Slide 0 is sign-in, don't auto-advance from it
        if (this.currentSlide === 0) {
            // Skip not allowed for sign-in unless explicitly clicked
            return;
        }
        if (this.currentSlide < 6) {
            this.startColorTransition(this.currentSlide + 1);
        } else {
            this.completeOnboarding();
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.startColorTransition(this.currentSlide - 1);
        }
    }

    startColorTransition(newSlide) {
        this.previousColorScheme = [...this.colorSchemes[this.currentSlide]];

        // Track slide view
        const slideNames = ['sign_in', 'welcome', 'privacy', 'tailor', 'context', 'features', 'complete'];
        if (slideNames[newSlide]) {
            trackEvent('onboarding_slide_view', {
                slide_number: newSlide,
                slide_name: slideNames[newSlide],
            });
        }

        this.currentSlide = newSlide;
        this.isTransitioning = true;
        this.transitionStartTime = performance.now();
    }

    // Interpolate between two color schemes
    interpolateColorSchemes(scheme1, scheme2, progress) {
        return scheme1.map((color1, index) => {
            const color2 = scheme2[index];
            return [
                color1[0] + (color2[0] - color1[0]) * progress,
                color1[1] + (color2[1] - color1[1]) * progress,
                color1[2] + (color2[2] - color1[2]) * progress,
            ];
        });
    }

    // Easing function for smooth transitions
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    handleContextInput(e) {
        this.contextText = e.target.value;
    }

    async handleClose() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('quit-application');
        }
    }

    async completeOnboarding() {
        // Save tailor preferences
        if (this.outputLanguage) {
            await cheatingDaddy.storage.updatePreference('outputLanguage', this.outputLanguage);
        }
        if (this.programmingLanguage) {
            await cheatingDaddy.storage.updatePreference('programmingLanguage', this.programmingLanguage);
        }
        if (this.audioLanguage) {
            await cheatingDaddy.storage.updatePreference('audioLanguage', this.audioLanguage);
        }

        if (this.contextText.trim()) {
            await cheatingDaddy.storage.updatePreference('customPrompt', this.contextText.trim());
            trackEvent('onboarding_context_added', {
                context_length: this.contextText.trim().length,
            });
        }
        await cheatingDaddy.storage.updateConfig('onboarded', true);

        // Track completion
        trackEvent('onboarding_completed', {
            output_language: this.outputLanguage,
            programming_language: this.programmingLanguage,
            audio_language: this.audioLanguage,
        });

        this.onComplete();
    }

    // Tailor form handlers
    handleOutputLanguageChange(e) {
        this.outputLanguage = e.target.value;
    }

    handleProgrammingLanguageChange(e) {
        this.programmingLanguage = e.target.value;
    }

    handleAudioLanguageChange(e) {
        this.audioLanguage = e.target.value;
    }

    // Auth handlers
    handleEmailInput(e) {
        this.authEmail = e.target.value;
    }

    handlePasswordInput(e) {
        this.authPassword = e.target.value;
    }

    async handleGoogleSignIn() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            this.authError = '';

            // Track Google sign-in attempt
            trackEvent('onboarding_auth_google');

            // Do not set authLoading = true to avoid locking UI
            try {
                // Call new Google Auth handler (Server-Side Flow)
                await ipcRenderer.invoke('auth:open-google');
            } catch (error) {
                this.authError = 'Failed to open sign-in. Please try again.';
                // No need to reset authLoading as we didn't set it
            }
        }
    }

    async handleEmailSignIn() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            this.authError = '';

            // Track email sign-in attempt
            trackEvent('onboarding_auth_email');

            try {
                // Call new Login Page handler (Email/Password Flow)
                await ipcRenderer.invoke('auth:open-login');
            } catch (error) {
                this.authError = 'Failed to open login page. Please try again.';
            }
        }
    }

    handleSignUp() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('auth:open-signup');
        }
    }

    handleSkipAuth() {
        // Track skip auth
        trackEvent('onboarding_auth_skip');

        // Skip auth and go to welcome slide
        this.startColorTransition(1);
    }

    openExternal(url) {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('open-external', url);
        }
    }

    // Listen for auth complete from main process
    firstUpdated() {
        this.canvas = this.shadowRoot.querySelector('.gradient-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        this.startGradientAnimation();

        window.addEventListener('resize', () => this.resizeCanvas());

        if (window.require) {
            const { ipcRenderer } = window.require('electron');

            // Check if already logged in
            ipcRenderer.invoke('auth:is-logged-in').then(result => {
                if (result && result.success && result.data === true) {
                    console.log('OnboardingView: User already logged in, skipping sign-in slide');
                    // Skip to welcome slide
                    this.startColorTransition(1);
                }
            });

            console.log('OnboardingView: Setting up auth-complete listener');
            ipcRenderer.on('auth-complete', (event, data) => {
                console.log('OnboardingView: Received auth-complete event:', data);
                this.authLoading = false;
                if (data.success) {
                    console.log('OnboardingView: Auth successful, transitioning to slide 1');
                    // Move to welcome slide on successful auth
                    this.startColorTransition(1);
                } else {
                    console.log('OnboardingView: Auth failed:', data.error);
                    this.authError = data.error || 'Authentication failed.';
                }
                this.requestUpdate();
            });
            console.log('OnboardingView: auth-complete listener set up');
        } else {
            console.warn('OnboardingView: window.require not available');
        }
    }

    getSlideContent() {
        const slides = [
            {
                // Auth slide has its own logo/title - hide default ones
                icon: null,
                title: '',
                content: '',
                showAuth: true,
            },
            {
                icon: 'assets/onboarding/welcome.svg',
                title: 'Welcome to Co-Interview',
                content:
                    'Your AI assistant that listens and watches, then provides intelligent suggestions automatically during interviews and meetings.',
            },
            {
                icon: 'assets/onboarding/security.svg',
                title: 'Completely Private',
                content: 'Invisible to screen sharing apps and recording software. Your secret advantage stays completely hidden from others.',
            },
            {
                icon: 'assets/onboarding/customize.svg',
                title: 'Tailor Your Co-Interviewer',
                content: 'Help your AI assistant provide better support by sharing information that matters to you.',
                showSuggestions: true,
            },
            {
                icon: 'assets/onboarding/context.svg',
                title: 'Add Your Context',
                content: 'Share relevant information to help the AI provide better, more personalized assistance.',
                showTextarea: true,
            },
            {
                icon: 'assets/onboarding/customize.svg',
                title: 'Additional Features',
                content: '',
                showFeatures: true,
            },
            {
                icon: 'assets/onboarding/ready.svg',
                title: 'Ready to Go',
                content: 'Add your Gemini API key in settings and start getting AI-powered assistance in real-time.',
            },
        ];

        return slides[this.currentSlide];
    }

    render() {
        const slide = this.getSlideContent();

        return html`
            <div class="onboarding-container">
                <button class="close-button" @click=${this.handleClose} title="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                        />
                    </svg>
                </button>
                <canvas class="gradient-canvas"></canvas>

                <div class="content-wrapper">
                    ${slide.icon ? html`<img class="slide-icon" src="${slide.icon}" alt="${slide.title} icon" />` : ''}
                    ${slide.title ? html`<div class="slide-title">${slide.title}</div>` : ''}
                    ${slide.content ? html`<div class="slide-content">${slide.content}</div>` : ''}
                    ${slide.showSuggestions
                ? html`
                              <div class="context-suggestions">
                                  <div class="suggestion-item">
                                      <span class="suggestion-icon">📝</span>
                                      <span class="suggestion-text">Your resume or professional background</span>
                                  </div>
                                  <div class="suggestion-item">
                                      <span class="suggestion-icon">🎯</span>
                                      <span class="suggestion-text">Job descriptions you're interviewing for</span>
                                  </div>
                                  <div class="suggestion-item">
                                      <span class="suggestion-icon">💼</span>
                                      <span class="suggestion-text">Specific topics or areas where you need help</span>
                                  </div>
                              </div>
                          `
                : ''}
                    ${slide.showTextarea
                ? html`
                              <textarea
                                  class="context-textarea"
                                  placeholder="Paste your resume, job description, or any relevant context here..."
                                  .value=${this.contextText}
                                  @input=${this.handleContextInput}
                              ></textarea>
                          `
                : ''}
                    ${slide.showFeatures
                ? html`
                              <div class="feature-list">
                                  <div class="feature-item">
                                      <span class="feature-icon">-</span>
                                      Customize AI behavior and responses
                                  </div>
                                  <div class="feature-item">
                                      <span class="feature-icon">-</span>
                                      Review conversation history
                                  </div>
                                  <div class="feature-item">
                                      <span class="feature-icon">-</span>
                                      Adjust capture settings and intervals
                                  </div>
                              </div>
                          `
                : ''}
                    ${slide.showAuth
                ? html`
                              <div class="auth-container">
                                  <!-- Logo -->
                                  <div class="auth-logo">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                          <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
                                          <path d="M12 12L20 7.5" />
                                          <path d="M12 12V21" />
                                          <path d="M12 12L4 7.5" />
                                      </svg>
                                  </div>

                                  <!-- Title -->
                                  <div class="auth-title">Welcome to Co-Interview</div>
                                  <div class="auth-subtitle">Your AI assistant for productivity</div>

                                  ${this.authError ? html`<div class="auth-error">${this.authError}</div>` : ''}

                                  <!-- Buttons -->
                                  <div class="auth-buttons">
                                      <button class="google-btn" @click=${this.handleGoogleSignIn} ?disabled=${this.authLoading}>
                                          <svg viewBox="0 0 24 24">
                                              <path
                                                  fill="#4285F4"
                                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                              />
                                              <path
                                                  fill="#34A853"
                                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                              />
                                              <path
                                                  fill="#FBBC05"
                                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                              />
                                              <path
                                                  fill="#EA4335"
                                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                              />
                                          </svg>
                                          ${this.authLoading ? 'Opening browser...' : 'Continue with Google'}
                                      </button>
                                      <button class="email-btn" @click=${this.handleEmailSignIn}>
                                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                              <rect x="2" y="4" width="20" height="16" rx="2" />
                                              <path d="M22 6L12 13L2 6" />
                                          </svg>
                                          Log in with email & password
                                      </button>
                                  </div>

                                  <!-- Links -->
                                  <div class="auth-links">
                                      <button class="auth-link" @click=${this.handleSignUp}>
                                          New to Co-Interview? Learn more
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                              <path d="M7 17L17 7" />
                                              <path d="M7 7H17V17" />
                                          </svg>
                                      </button>
                                  </div>

                                  <!-- Legal -->
                                  <div class="auth-legal">
                                      By signing in, you agree to our
                                      <a
                                          href="#"
                                          @click=${e => {
                        e.preventDefault();
                        this.openExternal('https://co-interview.com/policies/terms');
                    }}
                                          >Terms of Service</a
                                      >
                                      and
                                      <a
                                          href="#"
                                          @click=${e => {
                        e.preventDefault();
                        this.openExternal('https://co-interview.com/policies/privacy');
                    }}
                                          >Privacy Policy</a
                                      >
                                  </div>
                              </div>
                          `
                : ''}
                </div>

                <div class="navigation">
                    <button class="nav-button" @click=${this.prevSlide} ?disabled=${this.currentSlide === 0}>
                        <svg width="16px" height="16px" stroke-width="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>

                    <div class="progress-dots">
                        ${[0, 1, 2, 3, 4, 5, 6].map(
                    index => html`
                                <div
                                    class="dot ${index === this.currentSlide ? 'active' : ''}"
                                    @click=${() => {
                            if (index !== this.currentSlide && index !== 0) {
                                this.startColorTransition(index);
                            }
                        }}
                                ></div>
                            `
                )}
                    </div>

                    <button class="nav-button" @click=${() => (this.currentSlide === 0 ? this.handleSkipAuth() : this.nextSlide())}>
                        ${this.currentSlide === 6
                ? 'Get Started'
                : this.currentSlide === 0
                    ? 'Skip'
                    : html`
                                    <svg
                                        width="16px"
                                        height="16px"
                                        stroke-width="2"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                `}
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('onboarding-view', OnboardingView);
