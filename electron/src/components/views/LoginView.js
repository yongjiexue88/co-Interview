import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

// Import analytics for tracking
let trackEvent = () => {};
if (typeof window !== 'undefined' && window.require) {
    try {
        const { fileURLToPath } = window.require('url');
        const analyticsUrl = new URL('../../utils/analytics.js', import.meta.url);
        const analytics = window.require(fileURLToPath(analyticsUrl));
        trackEvent = analytics.trackEvent;
    } catch (error) {
        console.warn('[LoginView] Analytics not available:', error);
    }
}

export class LoginView extends LitElement {
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
            background: #0a0a0a;
        }

        .login-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .content-wrapper {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 32px 48px;
            max-width: 400px;
            width: 100%;
            color: #e5e5e5;
            text-align: center;
        }

        /* Sign-in slide styles - matching design */
        .auth-container {
            width: 100%;
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

        .auth-logo img {
            width: 64px;
            height: 64px;
            border-radius: 12px;
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
            margin-bottom: 24px; /* Increased margin to separate skip button */
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
            margin-top: 16px;
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

        .skip-container {
            margin-bottom: 16px;
        }

        .skip-button {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.5);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .skip-button:hover {
            background: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.8);
            border-color: rgba(255, 255, 255, 0.2);
        }
    `;

    static properties = {
        authLoading: { type: Boolean },
        authError: { type: String },
        onLoginSuccess: { type: Function },
        onSkip: { type: Function },
    };

    constructor() {
        super();
        this.authLoading = false;
        this.authError = '';
        this.onLoginSuccess = () => {};
        this.onSkip = () => {};
    }

    // Helper to get absolute asset path for packaged app
    getAssetPath(relativePath) {
        try {
            return new URL(`../../${relativePath}`, import.meta.url).toString();
        } catch (error) {
            console.warn('Failed to resolve asset path:', error);
            return relativePath;
        }
    }

    async handleGoogleSignIn() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            this.authError = '';
            trackEvent('login_auth_google');

            try {
                await ipcRenderer.invoke('auth:open-google');
            } catch (error) {
                this.authError = 'Failed to open sign-in. Please try again.';
            }
        }
    }

    async handleEmailSignIn() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            this.authError = '';
            trackEvent('login_auth_email');

            try {
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
        trackEvent('login_auth_skip');
        this.onSkip();
    }

    openExternal(url) {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('open-external', url);
        }
    }

    firstUpdated() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');

            console.log('LoginView: Setting up auth-complete listener');
            ipcRenderer.on('auth-complete', (event, data) => {
                console.log('LoginView: Received auth-complete event:', data);
                this.authLoading = false;
                if (data.success) {
                    console.log('LoginView: Auth successful');
                    this.onLoginSuccess();
                } else {
                    console.log('LoginView: Auth failed:', data.error);
                    this.authError = data.error || 'Authentication failed.';
                }
                this.requestUpdate();
            });
        }
    }

    render() {
        return html`
            <div class="login-container">
                <div class="content-wrapper">
                    <div class="auth-container">
                        <!-- Logo -->
                        <div class="auth-logo">
                            <img src="${this.getAssetPath('assets/logo.png')}" alt="Co-Interview" />
                        </div>

                        <!-- Title -->
                        <div class="auth-title">Welcome Back</div>
                        <div class="auth-subtitle">Sign in to continue to Co-Interview</div>

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
                                New to Co-Interview? Create an account
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
                </div>
            </div>
        `;
    }
}

customElements.define('login-view', LoginView);
