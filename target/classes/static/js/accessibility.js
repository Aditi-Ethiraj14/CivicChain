// Accessibility Features for CivicChain

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', function() {
    initializeAccessibility();
    setupKeyboardNavigation();
    setupScreenReaderSupport();
    setupHighContrastMode();
    setupReducedMotionSupport();
    setupVoiceRecognition();
});

function initializeAccessibility() {
    // Add ARIA labels and roles
    addAriaLabels();
    
    // Set up focus management
    setupFocusManagement();
    
    // Add skip links
    addSkipLinks();
    
    // Initialize voice commands
    initializeVoiceCommands();
    
    console.log('Accessibility features initialized');
}

function addAriaLabels() {
    // Add ARIA labels to form elements
    const formElements = document.querySelectorAll('input, select, textarea, button');
    formElements.forEach(element => {
        if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
            const label = element.closest('.form-group, .mb-3')?.querySelector('label');
            if (label) {
                const labelId = 'label-' + Math.random().toString(36).substr(2, 9);
                label.id = labelId;
                element.setAttribute('aria-labelledby', labelId);
            }
        }
    });

    // Add ARIA labels to navigation items
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const text = link.textContent.trim();
        if (text && !link.getAttribute('aria-label')) {
            link.setAttribute('aria-label', `Navigate to ${text}`);
        }
    });

    // Add ARIA labels to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
            const text = button.textContent.trim();
            const icon = button.querySelector('i');
            if (icon && !text) {
                // Button with only icon
                const iconClass = icon.className;
                if (iconClass.includes('fa-plus')) {
                    button.setAttribute('aria-label', 'Add new item');
                } else if (iconClass.includes('fa-edit')) {
                    button.setAttribute('aria-label', 'Edit item');
                } else if (iconClass.includes('fa-trash')) {
                    button.setAttribute('aria-label', 'Delete item');
                } else if (iconClass.includes('fa-search')) {
                    button.setAttribute('aria-label', 'Search');
                }
            }
        }
    });
}

function setupFocusManagement() {
    // Ensure modal focus management
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
            const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        });
    });

    // Add visible focus indicators
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
}

function addSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <a href="#navigation" class="skip-link">Skip to navigation</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);

    // Add target IDs if they don't exist
    const mainContent = document.querySelector('main, .main-content');
    if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content';
    }

    const navigation = document.querySelector('nav, .navbar');
    if (navigation && !navigation.id) {
        navigation.id = 'navigation';
    }
}

function setupKeyboardNavigation() {
    // Enhanced keyboard navigation for custom components
    document.addEventListener('keydown', function(e) {
        const activeElement = document.activeElement;
        
        switch(e.key) {
            case 'Enter':
                // Handle Enter key on clickable elements
                if (activeElement.classList.contains('btn') || 
                    activeElement.classList.contains('nav-link') ||
                    activeElement.classList.contains('card')) {
                    activeElement.click();
                }
                break;
                
            case 'Escape':
                // Close modals and dropdowns with Escape
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    const modal = bootstrap.Modal.getInstance(openModal);
                    if (modal) modal.hide();
                }
                
                const openDropdown = document.querySelector('.dropdown-menu.show');
                if (openDropdown) {
                    const dropdown = bootstrap.Dropdown.getInstance(openDropdown.previousElementSibling);
                    if (dropdown) dropdown.hide();
                }
                break;
                
            case 'ArrowDown':
            case 'ArrowUp':
                // Navigate through dropdown items
                if (activeElement.closest('.dropdown-menu')) {
                    e.preventDefault();
                    const items = Array.from(activeElement.closest('.dropdown-menu').querySelectorAll('.dropdown-item'));
                    const currentIndex = items.indexOf(activeElement);
                    const nextIndex = e.key === 'ArrowDown' ? 
                        (currentIndex + 1) % items.length : 
                        (currentIndex - 1 + items.length) % items.length;
                    items[nextIndex].focus();
                }
                break;
        }
    });
}

function setupScreenReaderSupport() {
    // Live region for dynamic content updates
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);

    // Announce dynamic content changes
    window.announceToScreenReader = function(message) {
        const liveRegion = document.getElementById('live-region');
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    };

    // Override showNotification to include screen reader announcements
    const originalShowNotification = window.showNotification;
    window.showNotification = function(message, type) {
        if (originalShowNotification) {
            originalShowNotification(message, type);
        }
        announceToScreenReader(`${type || 'info'}: ${message}`);
    };
}

function setupHighContrastMode() {
    // Detect high contrast mode preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    function handleContrastChange(e) {
        if (e.matches) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }
    
    handleContrastChange(mediaQuery);
    mediaQuery.addListener(handleContrastChange);

    // Add high contrast toggle button
    const contrastToggle = document.createElement('button');
    contrastToggle.className = 'btn btn-outline-secondary position-fixed';
    contrastToggle.style.cssText = 'top: 100px; right: 20px; z-index: 1050;';
    contrastToggle.innerHTML = '<i class="fas fa-adjust"></i>';
    contrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
    contrastToggle.title = 'Toggle high contrast mode';
    
    contrastToggle.addEventListener('click', function() {
        document.body.classList.toggle('high-contrast');
        const isEnabled = document.body.classList.contains('high-contrast');
        localStorage.setItem('high-contrast-mode', isEnabled.toString());
        announceToScreenReader(isEnabled ? 'High contrast mode enabled' : 'High contrast mode disabled');
    });

    // Load saved preference
    if (localStorage.getItem('high-contrast-mode') === 'true') {
        document.body.classList.add('high-contrast');
    }

    document.body.appendChild(contrastToggle);
}

function setupReducedMotionSupport() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function handleMotionChange(e) {
        if (e.matches) {
            document.body.classList.add('reduced-motion');
            // Disable animations
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion *, 
                .reduced-motion *::before, 
                .reduced-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }
    
    handleMotionChange(mediaQuery);
    mediaQuery.addListener(handleMotionChange);
}

function setupVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;

    // Add voice control button
    const voiceButton = document.createElement('button');
    voiceButton.className = 'btn btn-outline-primary position-fixed';
    voiceButton.style.cssText = 'top: 150px; right: 20px; z-index: 1050;';
    voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
    voiceButton.setAttribute('aria-label', 'Activate voice commands');
    voiceButton.title = 'Click and speak commands like "report issue" or "go home"';
    
    voiceButton.addEventListener('click', function() {
        if (isListening) {
            stopVoiceRecognition();
        } else {
            startVoiceRecognition();
        }
    });

    function startVoiceRecognition() {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            isListening = true;
            voiceButton.classList.add('btn-danger');
            voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            voiceButton.setAttribute('aria-label', 'Stop voice commands');
            announceToScreenReader('Voice recognition started. Speak your command.');
        };

        recognition.onresult = function(event) {
            const command = event.results[0][0].transcript.toLowerCase();
            console.log('Voice command:', command);
            processVoiceCommand(command);
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            announceToScreenReader('Voice recognition error: ' + event.error);
            stopVoiceRecognition();
        };

        recognition.onend = function() {
            stopVoiceRecognition();
        };

        recognition.start();
    }

    function stopVoiceRecognition() {
        if (recognition) {
            recognition.stop();
        }
        isListening = false;
        voiceButton.classList.remove('btn-danger');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceButton.setAttribute('aria-label', 'Activate voice commands');
    }

    function processVoiceCommand(command) {
        console.log('Processing voice command:', command);
        
        if (command.includes('home') || command.includes('go home')) {
            showSection('home');
            announceToScreenReader('Navigated to home page');
        } else if (command.includes('report') || command.includes('report issue')) {
            showSection('report');
            announceToScreenReader('Navigated to report issue page');
        } else if (command.includes('issues') || command.includes('browse issues')) {
            showSection('issues');
            announceToScreenReader('Navigated to browse issues page');
        } else if (command.includes('leaderboard') || command.includes('rankings')) {
            showSection('leaderboard');
            announceToScreenReader('Navigated to leaderboard page');
        } else if (command.includes('login') || command.includes('log in')) {
            showAuthModal();
            announceToScreenReader('Opened login modal');
        } else if (command.includes('logout') || command.includes('log out')) {
            handleLogout();
            announceToScreenReader('Logged out successfully');
        } else if (command.includes('connect wallet') || command.includes('metamask')) {
            if (window.MetaMask) {
                window.MetaMask.connectWallet();
                announceToScreenReader('Attempting to connect wallet');
            }
        } else {
            announceToScreenReader('Command not recognized. Try saying "report issue", "go home", "login", or "connect wallet"');
        }
    }

    document.body.appendChild(voiceButton);
}

function initializeVoiceCommands() {
    // Add voice command help
    const helpButton = document.createElement('button');
    helpButton.className = 'btn btn-outline-info position-fixed';
    helpButton.style.cssText = 'top: 200px; right: 20px; z-index: 1050;';
    helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
    helpButton.setAttribute('aria-label', 'Show accessibility help');
    helpButton.title = 'Show accessibility features and voice commands';
    
    helpButton.addEventListener('click', showAccessibilityHelp);
    document.body.appendChild(helpButton);
}

function showAccessibilityHelp() {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'accessibility-help-title');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="accessibility-help-title">
                        <i class="fas fa-universal-access"></i> Accessibility Features
                    </h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()" aria-label="Close help dialog"></button>
                </div>
                <div class="modal-body">
                    <h6>Keyboard Navigation</h6>
                    <ul>
                        <li><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> - Navigate between elements</li>
                        <li><kbd>Enter</kbd> / <kbd>Space</kbd> - Activate buttons and links</li>
                        <li><kbd>Escape</kbd> - Close modals and dropdowns</li>
                        <li><kbd>Arrow keys</kbd> - Navigate dropdown menus</li>
                    </ul>
                    
                    <h6>Voice Commands</h6>
                    <p>Click the microphone button and say:</p>
                    <ul>
                        <li>"Go home" - Navigate to home page</li>
                        <li>"Report issue" - Go to report issue page</li>
                        <li>"Browse issues" - View community issues</li>
                        <li>"Leaderboard" - View user rankings</li>
                        <li>"Login" - Open login modal</li>
                        <li>"Connect wallet" - Connect MetaMask wallet</li>
                    </ul>
                    
                    <h6>Accessibility Features</h6>
                    <ul>
                        <li><i class="fas fa-adjust"></i> High contrast mode toggle</li>
                        <li><i class="fas fa-microphone"></i> Voice commands</li>
                        <li>Screen reader optimized content</li>
                        <li>Reduced motion support</li>
                        <li>Skip navigation links</li>
                    </ul>
                    
                    <h6>Media Upload Support</h6>
                    <ul>
                        <li>Photo upload with drag & drop</li>
                        <li>Video recording and upload</li>
                        <li>Voice recording for issue descriptions</li>
                        <li>Alternative text support for images</li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove()">
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus the close button
    setTimeout(() => {
        const closeBtn = modal.querySelector('.btn-close');
        if (closeBtn) closeBtn.focus();
    }, 100);
    
    announceToScreenReader('Accessibility help dialog opened');
}

// Add CSS for accessibility features
const accessibilityCSS = `
.skip-links {
    position: absolute;
    top: -40px;
    left: 6px;
    z-index: 1100;
}

.skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
}

.skip-link:focus {
    top: 6px;
}

.keyboard-navigation *:focus {
    outline: 3px solid #007bff !important;
    outline-offset: 2px !important;
}

.high-contrast {
    filter: contrast(150%) brightness(120%);
}

.high-contrast .card,
.high-contrast .btn {
    border: 2px solid #000 !important;
}

.high-contrast .btn-primary {
    background-color: #000 !important;
    color: #fff !important;
}

.high-contrast .btn-outline-primary {
    color: #000 !important;
    border-color: #000 !important;
}

.reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
`;

// Inject accessibility CSS
const style = document.createElement('style');
style.textContent = accessibilityCSS;
document.head.appendChild(style);