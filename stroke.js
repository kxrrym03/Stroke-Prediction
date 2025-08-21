// Stroke Guardian AI - JavaScript Logic

class StrokeRiskAssessment {
    constructor() {
        this.form = document.getElementById('stroke-form');
        this.submitBtn = document.getElementById('submit-btn');
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.btnText = this.submitBtn.querySelector('.btn-text');
        this.defaultState = document.getElementById('default-state');
        this.resultsDisplay = document.getElementById('results-display');
        this.history = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormValidation();
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Action buttons
        document.getElementById('new-assessment-btn')?.addEventListener('click', () => {
            this.resetForm();
        });

        document.getElementById('consult-btn')?.addEventListener('click', () => {
            this.showToast('Consultation Recommended', 'Please consult with a healthcare professional for detailed evaluation.');
        });
    }

    setupFormValidation() {
        // Add input event listeners for real-time feedback
        const ageInput = document.getElementById('age');
        const glucoseInput = document.getElementById('avg_glucose_level');
        const bmiInput = document.getElementById('bmi');

        [ageInput, glucoseInput, bmiInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.validateField(input);
                });
            }
        });
    }

    validateField(field) {
        const value = field.value;
        const fieldName = field.name;
        let errorElement = null;
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'age':
                errorElement = document.getElementById('age-error');
                if (!value || value < 1 || value > 120) {
                    isValid = false;
                    errorMessage = 'Please enter a valid age (1-120)';
                }
                break;

            case 'avg_glucose_level':
                errorElement = document.getElementById('glucose-error');
                if (!value || value < 50 || value > 500) {
                    isValid = false;
                    errorMessage = 'Please enter a valid glucose level (50-500 mg/dL)';
                }
                break;

            case 'bmi':
                errorElement = document.getElementById('bmi-error');
                if (!value || value < 10 || value > 60) {
                    isValid = false;
                    errorMessage = 'Please enter a valid BMI (10-60)';
                }
                break;
        }

        if (errorElement) {
            if (isValid) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
                field.style.borderColor = 'var(--input-border)';
            } else {
                errorElement.textContent = errorMessage;
                errorElement.classList.add('show');
                field.style.borderColor = 'var(--risk-high)';
            }
        }

        return isValid;
    }

    clearFieldError(field) {
        const fieldName = field.name;
        let errorElement = null;

        switch (fieldName) {
            case 'age':
                errorElement = document.getElementById('age-error');
                break;
            case 'avg_glucose_level':
                errorElement = document.getElementById('glucose-error');
                break;
            case 'bmi':
                errorElement = document.getElementById('bmi-error');
                break;
        }

        if (errorElement && errorElement.classList.contains('show')) {
            errorElement.classList.remove('show');
            field.style.borderColor = 'var(--input-border)';
        }
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }

            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = 'var(--risk-high)';
            }
        });

        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showToast('Form Error', 'Please fill in all required fields with valid values.');
            return;
        }

        this.setLoading(true);
        
        try {
            const formData = this.collectFormData();
            const result = await this.calculateRisk(formData);
            
            this.displayResults(result);
            this.addToHistory(result);
            
            this.showToast('Assessment Complete', `Stroke risk level: ${result.risk_level} (${(result.probability * 100).toFixed(1)}%)`);
            
        } catch (error) {
            console.error('Risk calculation error:', error);
            this.showToast('Error', 'Failed to calculate stroke risk. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};

        // Convert form data to the expected format
        for (let [key, value] of formData.entries()) {
            if (['age', 'hypertension', 'heart_disease', 'avg_glucose_level', 'bmi'].includes(key)) {
                data[key] = Number(value);
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    async calculateRisk(formData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Risk calculation algorithm based on medical factors
        let riskScore = 0;
        
        // Age factor (stronger influence after 55)
        if (formData.age > 65) riskScore += 0.3;
        else if (formData.age > 55) riskScore += 0.2;
        else if (formData.age > 45) riskScore += 0.1;
        
        // Gender factor
        if (formData.gender === 'Male') riskScore += 0.05;
        
        // Medical conditions
        if (formData.hypertension) riskScore += 0.25;
        if (formData.heart_disease) riskScore += 0.3;
        
        // Lifestyle factors
        if (formData.smoking_status === 'smokes') riskScore += 0.2;
        else if (formData.smoking_status === 'formerly smoked') riskScore += 0.1;
        
        // BMI factor
        if (formData.bmi > 30) riskScore += 0.15;
        else if (formData.bmi > 25) riskScore += 0.05;
        
        // Glucose level factor
        if (formData.avg_glucose_level > 200) riskScore += 0.2;
        else if (formData.avg_glucose_level > 140) riskScore += 0.1;
        
        // Work type factor (some correlation with stress/lifestyle)
        if (formData.work_type === 'Self-employed') riskScore += 0.02;
        
        // Marital status (slight protective effect)
        if (formData.ever_married === 'Yes') riskScore -= 0.02;
        
        // Add some realistic variation (±10%)
        const variation = (Math.random() - 0.5) * 0.2;
        riskScore += variation;
        
        // Ensure score is between 0.05 and 0.95 for realistic results
        const probability = Math.min(Math.max(riskScore, 0.05), 0.95);
        
        // Determine risk level
        let risk_level;
        if (probability < 0.33) risk_level = 'Low';
        else if (probability < 0.66) risk_level = 'Moderate';
        else risk_level = 'High';
        
        return {
            probability,
            risk_level,
            timestamp: new Date(),
            formData
        };
    }

    displayResults(result) {
        // Hide default state and show results
        this.defaultState.classList.add('hidden');
        this.resultsDisplay.classList.remove('hidden');
        
        // Add animation class
        this.resultsDisplay.classList.add('bounce-gentle');
        
        // Update risk display
        this.updateRiskDisplay(result);
        this.updateExplanation(result);
        this.updateAssessmentDetails(result);
        
        // Animate progress bar
        setTimeout(() => {
            const progressFill = document.getElementById('progress-fill');
            if (progressFill) {
                progressFill.style.width = `${result.probability * 100}%`;
            }
        }, 300);
    }

    updateRiskDisplay(result) {
        const { probability, risk_level } = result;
        
        // Update risk icon
        const riskIcon = document.getElementById('risk-icon');
        if (riskIcon) {
            riskIcon.innerHTML = '';
            const iconElement = document.createElement('i');
            
            switch (risk_level) {
                case 'Low':
                    iconElement.setAttribute('data-lucide', 'check-circle');
                    iconElement.style.color = 'var(--risk-low)';
                    break;
                case 'Moderate':
                    iconElement.setAttribute('data-lucide', 'alert-circle');
                    iconElement.style.color = 'var(--risk-moderate)';
                    break;
                case 'High':
                    iconElement.setAttribute('data-lucide', 'alert-triangle');
                    iconElement.style.color = 'var(--risk-high)';
                    break;
            }
            
            riskIcon.appendChild(iconElement);
            lucide.createIcons();
        }
        
        // Update risk badge
        const riskBadge = document.getElementById('risk-badge');
        if (riskBadge) {
            riskBadge.textContent = `${this.getRiskTitle(risk_level)} Risk`;
            riskBadge.className = `risk-badge ${risk_level.toLowerCase()}`;
        }
        
        // Update probability score
        const probabilityScore = document.getElementById('probability-score');
        if (probabilityScore) {
            probabilityScore.textContent = `${(probability * 100).toFixed(1)}%`;
        }
    }

    updateExplanation(result) {
        const riskInfo = this.getRiskInformation(result.risk_level);
        
        const riskMessage = document.getElementById('risk-message');
        const riskRecommendation = document.getElementById('risk-recommendation');
        
        if (riskMessage) {
            riskMessage.textContent = riskInfo.message;
        }
        
        if (riskRecommendation) {
            riskRecommendation.textContent = riskInfo.recommendation;
        }
    }

    updateAssessmentDetails(result) {
        const { timestamp, probability } = result;
        
        const assessmentDate = document.getElementById('assessment-date');
        const assessmentTime = document.getElementById('assessment-time');
        const assessmentPrecision = document.getElementById('assessment-precision');
        
        if (assessmentDate) {
            assessmentDate.textContent = timestamp.toLocaleDateString();
        }
        
        if (assessmentTime) {
            assessmentTime.textContent = timestamp.toLocaleTimeString();
        }
        
        if (assessmentPrecision) {
            assessmentPrecision.textContent = probability.toFixed(4);
        }
    }

    getRiskTitle(risk_level) {
        switch (risk_level) {
            case 'Low': return 'Low';
            case 'Moderate': return 'Moderate';
            case 'High': return 'Higher';
            default: return 'Unknown';
        }
    }

    getRiskInformation(risk_level) {
        switch (risk_level) {
            case 'Low':
                return {
                    message: 'Your current risk factors suggest a lower probability of stroke. Continue maintaining healthy lifestyle choices.',
                    recommendation: 'Keep up with regular exercise, healthy diet, and routine medical checkups.'
                };
            case 'Moderate':
                return {
                    message: 'You have some risk factors that may increase stroke probability. Consider lifestyle modifications.',
                    recommendation: 'Consult your healthcare provider about risk reduction strategies and monitoring.'
                };
            case 'High':
                return {
                    message: 'Multiple risk factors indicate elevated stroke risk. Medical consultation is strongly recommended.',
                    recommendation: 'Schedule an appointment with your healthcare provider for comprehensive evaluation.'
                };
            default:
                return {
                    message: 'Unable to determine risk level.',
                    recommendation: 'Please consult with a healthcare professional.'
                };
        }
    }

    addToHistory(result) {
        this.history.unshift(result);
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
    }

    resetForm() {
        // Reset form
        this.form.reset();
        
        // Clear all error messages
        const errorElements = this.form.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.classList.remove('show');
        });
        
        // Reset field borders
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.style.borderColor = 'var(--input-border)';
        });
        
        // Hide results and show default state
        this.resultsDisplay.classList.add('hidden');
        this.defaultState.classList.remove('hidden');
        
        // Scroll to form
        this.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.disabled = true;
            this.btnText.style.display = 'none';
            this.loadingSpinner.classList.add('show');
        } else {
            this.submitBtn.disabled = false;
            this.btnText.style.display = 'inline';
            this.loadingSpinner.classList.remove('show');
        }
    }

    showToast(title, description, duration = 5000) {
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toast-title');
        const toastDescription = document.getElementById('toast-description');
        const toastIcon = document.getElementById('toast-icon');
        
        if (toast && toastTitle && toastDescription) {
            toastTitle.textContent = title;
            toastDescription.textContent = description;
            
            // Set appropriate icon
            toastIcon.innerHTML = '';
            const iconElement = document.createElement('i');
            
            if (title.toLowerCase().includes('error')) {
                iconElement.setAttribute('data-lucide', 'alert-circle');
                iconElement.style.color = 'var(--risk-high)';
            } else if (title.toLowerCase().includes('complete')) {
                iconElement.setAttribute('data-lucide', 'check-circle');
                iconElement.style.color = 'var(--risk-low)';
            } else {
                iconElement.setAttribute('data-lucide', 'info');
                iconElement.style.color = 'var(--primary)';
            }
            
            toastIcon.appendChild(iconElement);
            lucide.createIcons();
            
            // Show toast
            toast.classList.remove('hidden');
            
            // Hide after duration
            setTimeout(() => {
                toast.classList.add('hidden');
            }, duration);
        }
    }
}

// Utility Functions
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Initialize the stroke risk assessment
    new StrokeRiskAssessment();
    
    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Initialize intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StrokeRiskAssessment };
}