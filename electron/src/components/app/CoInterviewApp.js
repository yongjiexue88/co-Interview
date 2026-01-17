import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';
import './AppHeader.js';
import '../views/MainView.js';
import '../views/CustomizeView.js';
import '../views/HelpView.js';
import '../views/HistoryView.js';
import '../views/AssistantView.js';
import '../views/OnboardingView.js';

// Import analytics for tracking
let trackEvent = () => {};
if (typeof window !== 'undefined' && window.require) {
    try {
        const { fileURLToPath } = window.require('url');
        const analyticsUrl = new URL('../../utils/analytics.js', import.meta.url);
        const analytics = window.require(fileURLToPath(analyticsUrl));
        trackEvent = analytics.trackEvent;
    } catch (error) {
        console.warn('[CoInterviewApp] Analytics not available:', error);
    }
}

export class CoInterviewApp extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family:
                'Inter',
                -apple-system,
                BlinkMacSystemFont,
                sans-serif;
            margin: 0px;
            padding: 0px;
            cursor: default;
            user-select: none;
        }

        :host {
            display: block;
            width: 100%;
            height: 100vh;
            background-color: var(--background-transparent);
            color: var(--text-color);
        }

        .window-container {
            height: 100vh;
            overflow: hidden;
            background: transparent;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .main-content {
            flex: 1;
            padding: var(--main-content-padding);
            overflow-y: auto;
            background: var(--main-content-background);
        }

        .main-content.with-border {
            border-top: none;
        }

        .main-content.assistant-view {
            padding: 12px;
        }

        .main-content.onboarding-view {
            padding: 0;
            background: transparent;
        }

        .main-content.settings-view,
        .main-content.help-view,
        .main-content.history-view {
            padding: 0;
        }

        .view-container {
            opacity: 1;
            height: 100%;
        }

        .view-container.entering {
            opacity: 0;
        }

        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-thumb-hover);
        }
    `;

    static properties = {
        currentView: { type: String },
        statusText: { type: String },
        startTime: { type: Number },
        isRecording: { type: Boolean },
        sessionActive: { type: Boolean },
        selectedProfile: { type: String },
        selectedLanguage: { type: String },
        responses: { type: Array },
        currentResponseIndex: { type: Number },
        selectedScreenshotInterval: { type: String },
        selectedImageQuality: { type: String },
        layoutMode: { type: String },
        _viewInstances: { type: Object, state: true },
        _isClickThrough: { state: true },
        _awaitingNewResponse: { state: true },
        shouldAnimateResponse: { type: Boolean },
        _storageLoaded: { state: true },
    };

    constructor() {
        super();
        // Set defaults - will be overwritten by storage
        this.currentView = 'onboarding'; // Will check onboarding after storage loads
        this.statusText = '';
        this.startTime = null;
        this.isRecording = false;
        this.sessionActive = false;
        this.selectedProfile = 'interview';
        this.selectedLanguage = 'en-US';
        this.selectedScreenshotInterval = '5';
        this.selectedImageQuality = 'medium';
        this.layoutMode = 'normal';
        this.responses = [];
        this.currentResponseIndex = -1;
        this._viewInstances = new Map();
        this._isClickThrough = false;
        this._awaitingNewResponse = false;
        this._currentResponseIsComplete = true;
        this.shouldAnimateResponse = false;
        this._storageLoaded = false;

        // Load from storage
        this._loadFromStorage();
    }

    getCurrentView() {
        return this.currentView;
    }

    getLayoutMode() {
        return this.layoutMode;
    }

    async _loadFromStorage() {
        try {
            const electron = window.require ? window.require('electron') : require('electron');
            const ipcRenderer = electron.ipcRenderer;

            const [configResult, prefsResult] = await Promise.all([
                ipcRenderer.invoke('storage:get-config'),
                ipcRenderer.invoke('storage:get-preferences'),
            ]);

            const config = configResult.success ? configResult.data : {};
            const prefs = prefsResult.success ? prefsResult.data : {};

            // Check onboarding status
            // In development mode, always show onboarding for testing
            // In production, skip onboarding if already completed
            const isDev = ipcRenderer.sendSync('is-dev');
            this.currentView = isDev || !config?.onboardingComplete ? 'onboarding' : 'assistant';

            // Apply background appearance (color + transparency)
            this.applyBackgroundAppearance(prefs.backgroundColor ?? '#1e1e1e', prefs.backgroundTransparency ?? 0.2);

            // Load preferences
            this.selectedProfile = prefs.selectedProfile || 'interview';
            this.selectedLanguage = prefs.selectedLanguage || 'en-US';
            this.selectedScreenshotInterval = prefs.selectedScreenshotInterval || '5';
            this.selectedImageQuality = prefs.selectedImageQuality || 'medium';
            this.layoutMode = config.layout || 'normal';

            this._storageLoaded = true;
            this.updateLayoutMode();
            this.requestUpdate();

            // Track app launch
            if (typeof trackEvent === 'function') {
                trackEvent('app_launched', {
                    initial_view: this.currentView,
                    layout_mode: this.layoutMode,
                });
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
            this._storageLoaded = true;
            this.requestUpdate();
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : { r: 30, g: 30, b: 30 };
    }

    lightenColor(rgb, amount) {
        return {
            r: Math.min(255, rgb.r + amount),
            g: Math.min(255, rgb.g + amount),
            b: Math.min(255, rgb.b + amount),
        };
    }

    applyBackgroundAppearance(backgroundColor, alpha) {
        const root = document.documentElement;
        const baseRgb = this.hexToRgb(backgroundColor);

        // Generate color variants based on the base color
        const secondary = this.lightenColor(baseRgb, 7);
        const tertiary = this.lightenColor(baseRgb, 15);
        const hover = this.lightenColor(baseRgb, 20);

        root.style.setProperty('--header-background', `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha})`);
        root.style.setProperty('--main-content-background', `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha})`);
        root.style.setProperty('--bg-primary', `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha})`);
        root.style.setProperty('--bg-secondary', `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${alpha})`);
        root.style.setProperty('--bg-tertiary', `rgba(${tertiary.r}, ${tertiary.g}, ${tertiary.b}, ${alpha})`);
        root.style.setProperty('--bg-hover', `rgba(${hover.r}, ${hover.g}, ${hover.b}, ${alpha})`);
        root.style.setProperty('--input-background', `rgba(${tertiary.r}, ${tertiary.g}, ${tertiary.b}, ${alpha})`);
        root.style.setProperty('--input-focus-background', `rgba(${tertiary.r}, ${tertiary.g}, ${tertiary.b}, ${alpha})`);
        root.style.setProperty('--hover-background', `rgba(${hover.r}, ${hover.g}, ${hover.b}, ${alpha})`);
        root.style.setProperty('--scrollbar-background', `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha})`);
    }

    // Keep old function name for backwards compatibility
    applyBackgroundTransparency(alpha) {
        this.applyBackgroundAppearance('#1e1e1e', alpha);
    }

    connectedCallback() {
        super.connectedCallback();

        // Apply layout mode to document root
        this.updateLayoutMode();

        // Set up IPC listeners if needed
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.on('new-response', (_, response) => {
                this.addNewResponse(response);
            });
            ipcRenderer.on('update-response', (_, response) => {
                this.updateCurrentResponse(response);
            });
            ipcRenderer.on('update-status', (_, status) => {
                this.setStatus(status);
            });
            ipcRenderer.on('click-through-toggled', (_, isEnabled) => {
                this._isClickThrough = isEnabled;
            });
            ipcRenderer.on('reconnect-failed', (_, data) => {
                this.addNewResponse(data.message);
            });
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.removeAllListeners('new-response');
            ipcRenderer.removeAllListeners('update-response');
            ipcRenderer.removeAllListeners('update-status');
            ipcRenderer.removeAllListeners('click-through-toggled');
            ipcRenderer.removeAllListeners('reconnect-failed');
        }
    }

    setStatus(text) {
        this.statusText = text;

        // Mark response as complete when we get certain status messages
        if (text.includes('Ready') || text.includes('Listening') || text.includes('Error')) {
            this._currentResponseIsComplete = true;
            console.log('[setStatus] Marked current response as complete');
        }
    }

    addNewResponse(response) {
        // Add a new response entry (first word of a new AI response)
        this.responses = [...this.responses, response];
        this.currentResponseIndex = this.responses.length - 1;
        this._awaitingNewResponse = false;
        console.log('[addNewResponse] Added:', response);
        this.requestUpdate();
    }

    updateCurrentResponse(response) {
        // Update the current response in place (streaming subsequent words)
        if (this.responses.length > 0) {
            this.responses = [...this.responses.slice(0, -1), response];
            console.log('[updateCurrentResponse] Updated to:', response);
        } else {
            // Fallback: if no responses exist, add as new
            this.addNewResponse(response);
        }
        this.requestUpdate();
    }

    // Header event handlers
    handleCustomizeClick() {
        this.currentView = 'customize';
        this.requestUpdate();
    }

    handleHelpClick() {
        this.currentView = 'help';
        this.requestUpdate();
    }

    handleHistoryClick() {
        this.currentView = 'history';
        this.requestUpdate();
    }

    async handleClose() {
        if (this.currentView === 'customize' || this.currentView === 'help' || this.currentView === 'history') {
            // Return to assistant (listening) view - main/API key page is removed
            this.currentView = 'assistant';
        } else if (this.currentView === 'assistant') {
            if (window.coInterview?.stopCapture) {
                window.coInterview.stopCapture();
            }

            // Close the session and quit application
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('close-session');
                await ipcRenderer.invoke('quit-application');
            }
            this.sessionActive = false;
        } else {
            // Quit the entire application
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('quit-application');
            }
        }
    }

    async handleHideToggle() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('toggle-window-visibility');
        }
    }

    // Main view event handlers
    async handleStart() {
        // With managed quota system, backend handles ephemeral tokens
        // No need to check for local API key anymore
        if (window.coInterview?.initializeGemini) {
            await window.coInterview.initializeGemini(this.selectedProfile, this.selectedLanguage);
        }

        // Pass the screenshot interval as string (including 'manual' option)
        if (window.coInterview?.startCapture) {
            window.coInterview.startCapture(this.selectedScreenshotInterval, this.selectedImageQuality);
        }

        this.responses = [];
        this.currentResponseIndex = -1;
        this.startTime = Date.now();
        this.currentView = 'assistant';

        // Analytics: Track session start
        if (typeof trackEvent === 'function') {
            trackEvent('session_start', {
                profile: this.selectedProfile,
                language: this.selectedLanguage,
            });
        }
    }

    async handleAPIKeyHelp() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-external', 'https://cheatingdaddy.com/help/api-key');
        }
    }

    // Customize view event handlers
    async handleProfileChange(profile) {
        this.selectedProfile = profile;
        const electron = window.require ? window.require('electron') : require('electron');
        await electron.ipcRenderer.invoke('storage:update-preference', 'selectedProfile', profile);
    }

    async handleLanguageChange(language) {
        this.selectedLanguage = language;
        const electron = window.require ? window.require('electron') : require('electron');
        await electron.ipcRenderer.invoke('storage:update-preference', 'selectedLanguage', language);
    }

    async handleScreenshotIntervalChange(interval) {
        this.selectedScreenshotInterval = interval;
        const electron = window.require ? window.require('electron') : require('electron');
        await electron.ipcRenderer.invoke('storage:update-preference', 'selectedScreenshotInterval', interval);
    }

    async handleImageQualityChange(quality) {
        this.selectedImageQuality = quality;
        const electron = window.require ? window.require('electron') : require('electron');
        await electron.ipcRenderer.invoke('storage:update-preference', 'selectedImageQuality', quality);
    }

    handleBackClick() {
        // Navigate to assistant view - main/API key page is removed
        this.currentView = 'assistant';
        this.requestUpdate();
    }

    // Help view event handlers
    async handleExternalLinkClick(url) {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('open-external', url);
        }
    }

    // Assistant view event handlers
    async handleSendText(message) {
        // Check if coInterview API is available
        if (!window.coInterview) {
            console.error('[handleSendText] window.coInterview not available');
            this.setStatus('Error: App not fully initialized. Please wait...');
            return;
        }

        if (!window.coInterview.sendTextMessage) {
            console.error('[handleSendText] sendTextMessage not available. Available methods:', Object.keys(window.coInterview));
            this.setStatus('Error: Text messaging not available. Please restart.');
            return;
        }

        const result = await window.coInterview.sendTextMessage(message);

        if (!result.success) {
            console.error('Failed to send message:', result.error);
            this.setStatus('Error sending message: ' + result.error);
        } else {
            this.setStatus('Message sent...');
            this._awaitingNewResponse = true;

            // Analytics: Track message sent
            if (typeof trackEvent === 'function') {
                trackEvent('message_sent', {
                    component: 'AssistantView',
                });
            }
        }
    }

    handleResponseIndexChanged(e) {
        this.currentResponseIndex = e.detail.index;
        this.shouldAnimateResponse = false;
        this.requestUpdate();
    }

    // Onboarding event handlers
    async handleOnboardingComplete() {
        // With managed quota system, go directly to assistant (listening) view
        // Backend handles ephemeral tokens - no need for API key entry
        this.responses = [];
        this.currentResponseIndex = -1;
        this.startTime = Date.now();

        // Save onboarding complete status
        const electron = window.require ? window.require('electron') : require('electron');
        await electron.ipcRenderer.invoke('storage:update-config', 'onboardingComplete', true);

        // Initialize session
        if (window.coInterview?.initializeGemini) {
            await window.coInterview.initializeGemini(this.selectedProfile, this.selectedLanguage);
        }

        // Start capture
        if (window.coInterview?.startCapture) {
            window.coInterview.startCapture(this.selectedScreenshotInterval, this.selectedImageQuality);
        }

        // Analytics
        if (typeof trackEvent === 'function') {
            trackEvent('session_start', {
                profile: this.selectedProfile,
                language: this.selectedLanguage,
                from: 'onboarding',
            });
        }

        this.currentView = 'assistant';
    }

    updated(changedProperties) {
        super.updated(changedProperties);

        // Only notify main process of view change if the view actually changed
        if (changedProperties.has('currentView') && window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('view-changed', this.currentView);

            // Add a small delay to smooth out the transition
            const viewContainer = this.shadowRoot?.querySelector('.view-container');
            if (viewContainer) {
                viewContainer.classList.add('entering');
                requestAnimationFrame(() => {
                    viewContainer.classList.remove('entering');
                });
            }
        }

        if (changedProperties.has('layoutMode')) {
            this.updateLayoutMode();
        }
    }

    renderCurrentView() {
        // Only re-render the view if it hasn't been cached or if critical properties changed

        switch (this.currentView) {
            case 'onboarding':
                return html`
                    <onboarding-view .onComplete=${() => this.handleOnboardingComplete()} .onClose=${() => this.handleClose()}></onboarding-view>
                `;

            case 'main':
                return html`
                    <main-view
                        .onStart=${() => this.handleStart()}
                        .onAPIKeyHelp=${() => this.handleAPIKeyHelp()}
                        .onLayoutModeChange=${layoutMode => this.handleLayoutModeChange(layoutMode)}
                    ></main-view>
                `;

            case 'customize':
                return html`
                    <customize-view
                        .selectedProfile=${this.selectedProfile}
                        .selectedLanguage=${this.selectedLanguage}
                        .selectedScreenshotInterval=${this.selectedScreenshotInterval}
                        .selectedImageQuality=${this.selectedImageQuality}
                        .layoutMode=${this.layoutMode}
                        .onProfileChange=${profile => this.handleProfileChange(profile)}
                        .onLanguageChange=${language => this.handleLanguageChange(language)}
                        .onScreenshotIntervalChange=${interval => this.handleScreenshotIntervalChange(interval)}
                        .onImageQualityChange=${quality => this.handleImageQualityChange(quality)}
                        .onLayoutModeChange=${layoutMode => this.handleLayoutModeChange(layoutMode)}
                    ></customize-view>
                `;

            case 'help':
                return html` <help-view .onExternalLinkClick=${url => this.handleExternalLinkClick(url)}></help-view> `;

            case 'history':
                return html` <history-view></history-view> `;

            case 'assistant':
                return html`
                    <assistant-view
                        .responses=${this.responses}
                        .currentResponseIndex=${this.currentResponseIndex}
                        .selectedProfile=${this.selectedProfile}
                        .onSendText=${message => this.handleSendText(message)}
                        .shouldAnimateResponse=${this.shouldAnimateResponse}
                        @response-index-changed=${this.handleResponseIndexChanged}
                        @response-animation-complete=${() => {
                            this.shouldAnimateResponse = false;
                            this._currentResponseIsComplete = true;
                            console.log('[response-animation-complete] Marked current response as complete');
                            this.requestUpdate();
                        }}
                    ></assistant-view>
                `;

            default:
                return html`<div>Unknown view: ${this.currentView}</div>`;
        }
    }

    render() {
        const viewClassMap = {
            assistant: 'assistant-view',
            onboarding: 'onboarding-view',
            customize: 'settings-view',
            help: 'help-view',
            history: 'history-view',
        };
        const mainContentClass = `main-content ${viewClassMap[this.currentView] || 'with-border'}`;

        return html`
            <div class="window-container">
                <div class="container">
                    <app-header
                        .currentView=${this.currentView}
                        .statusText=${this.statusText}
                        .startTime=${this.startTime}
                        .onCustomizeClick=${() => this.handleCustomizeClick()}
                        .onHelpClick=${() => this.handleHelpClick()}
                        .onHistoryClick=${() => this.handleHistoryClick()}
                        .onCloseClick=${() => this.handleClose()}
                        .onBackClick=${() => this.handleBackClick()}
                        .onHideToggleClick=${() => this.handleHideToggle()}
                        ?isClickThrough=${this._isClickThrough}
                    ></app-header>
                    <div class="${mainContentClass}">
                        <div class="view-container">${this.renderCurrentView()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    updateLayoutMode() {
        // Apply or remove compact layout class to document root
        if (this.layoutMode === 'compact') {
            document.documentElement.classList.add('compact-layout');
        } else {
            document.documentElement.classList.remove('compact-layout');
        }
    }

    async handleLayoutModeChange(layoutMode) {
        this.layoutMode = layoutMode;
        const electron = window.require ? window.require('electron') : require('electron');
        await electron.ipcRenderer.invoke('storage:update-config', 'layout', layoutMode);
        this.updateLayoutMode();

        // Notify main process about layout change for window resizing
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('update-sizes');
            } catch (error) {
                console.error('Failed to update sizes in main process:', error);
            }
        }

        this.requestUpdate();
    }
}

customElements.define('co-interview-app', CoInterviewApp);
