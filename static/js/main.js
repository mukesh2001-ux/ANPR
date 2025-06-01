// Main JavaScript for ANPR System

// Global variables
let socket = null;
let isConnected = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize form validations
    initializeFormValidations();
    
    // Initialize auto-refresh for dashboard
    initializeAutoRefresh();
    
    // Add fade-in animation to cards
    addFadeInAnimation();
    
    console.log('ANPR System initialized successfully');
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Form validation enhancements
function initializeFormValidations() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.prototype.slice.call(forms).forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

// Auto-refresh dashboard data
function initializeAutoRefresh() {
    if (window.location.pathname === '/dashboard' || window.location.pathname === '/') {
        // Refresh dashboard stats every 30 seconds
        setInterval(refreshDashboardStats, 30000);
    }
}

function refreshDashboardStats() {
    fetch('/api/dashboard-stats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateDashboardStats(data.stats);
            }
        })
        .catch(error => {
            console.error('Error refreshing dashboard stats:', error);
        });
}

function updateDashboardStats(stats) {
    // Update stat cards if they exist
    const elements = {
        'total_detections': stats.total_detections,
        'successful_ocr': stats.successful_ocr,
        'user_detections': stats.user_detections,
        'accuracy': stats.accuracy
    };
    
    Object.keys(elements).forEach(key => {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (element) {
            animateNumber(element, elements[key]);
        }
    });
}

// Animate number changes
function animateNumber(element, newValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = (newValue - currentValue) / 20;
    let current = currentValue;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= newValue) || (increment < 0 && current <= newValue)) {
            current = newValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 50);
}

// Add fade-in animation to cards
function addFadeInAnimation() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Utility Functions

// Show loading spinner
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
    element.disabled = true;
    
    return function hideLoading() {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = getOrCreateToastContainer();
    
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

function getOrCreateToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
    }
    return container;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showToast('Copied to clipboard!', 'success');
    }, function(err) {
        console.error('Could not copy text: ', err);
        showToast('Failed to copy to clipboard', 'danger');
    });
}

// Download file
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Confirm dialog with custom styling
function confirmDialog(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
        const modalId = 'confirm-modal-' + Date.now();
        const modalHtml = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirm-btn">Confirm</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        const confirmBtn = document.getElementById('confirm-btn');
        
        confirmBtn.addEventListener('click', () => {
            modal.hide();
            resolve(true);
        });
        
        document.getElementById(modalId).addEventListener('hidden.bs.modal', function() {
            document.getElementById(modalId).remove();
            resolve(false);
        });
        
        modal.show();
    });
}

// Image preview functionality
function previewImage(input, previewElement) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Auto-save form data to localStorage
function autoSaveForm(formId, excludeFields = []) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const saveKey = 'autosave_' + formId;
    
    // Load saved data
    const savedData = localStorage.getItem(saveKey);
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.keys(data).forEach(name => {
            const field = form.querySelector(`[name="${name}"]`);
            if (field && !excludeFields.includes(name)) {
                field.value = data[name];
            }
        });
    }
    
    // Save data on input
    form.addEventListener('input', debounce(() => {
        const formData = new FormData(form);
        const data = {};
        
        for (let [name, value] of formData.entries()) {
            if (!excludeFields.includes(name)) {
                data[name] = value;
            }
        }
        
        localStorage.setItem(saveKey, JSON.stringify(data));
    }, 1000));
    
    // Clear saved data on successful submit
    form.addEventListener('submit', () => {
        localStorage.removeItem(saveKey);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S to save/capture (prevent default save)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const captureBtn = document.getElementById('captureBtn');
        if (captureBtn && !captureBtn.disabled) {
            captureBtn.click();
        }
    }
    
    // Escape to stop detection
    if (e.key === 'Escape') {
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn && !stopBtn.disabled) {
            stopBtn.click();
        }
    }
    
    // Space to start/stop detection
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (startBtn && !startBtn.disabled) {
            startBtn.click();
        } else if (stopBtn && !stopBtn.disabled) {
            stopBtn.click();
        }
    }
});

// Export functions for global use
window.ANPRSystem = {
    showToast,
    showLoading,
    confirmDialog,
    copyToClipboard,
    downloadFile,
    formatDate,
    formatFileSize,
    previewImage,
    autoSaveForm,
    debounce
};
