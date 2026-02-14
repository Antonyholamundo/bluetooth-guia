/**
 * Jammer Bluetooth Landing Page Logic
 * Handles animations, smooth scrolling, and PayPal integration.
 */

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initIntersectionObserver();
    initPayPal();
});

/* 1. Smooth Scrolling */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* 2. Intersection Observer for Fade-in Animations */
function initIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once visible to run animation only once
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });
}

/* 3. PayPal Integration with Dynamic Loading */
function initPayPal() {
    // Check if CONFIG is available
    if (typeof CONFIG === 'undefined' || !CONFIG.PAYPAL_CLIENT_ID) {
        console.error('Configuración faltante en js/config.js');
        showPayPalError('Error de configuración del sistema.');
        return;
    }

    // Si el SDK ya está cargado, renderizar botones import
    if (typeof paypal !== 'undefined') {
        renderPayPalButtons();
        return;
    }

    // Cargar SDK dinámicamente
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${CONFIG.PAYPAL_CLIENT_ID}&currency=${CONFIG.PRODUCT.CURRENCY}`;
    script.async = true;

    script.onload = () => {
        renderPayPalButtons();
    };

    script.onerror = () => {
        showPayPalError('No se pudo conectar con PayPal.');
    };

    document.head.appendChild(script);
}

function renderPayPalButtons() {
    paypal.Buttons({
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [{
                    description: CONFIG.PRODUCT.NAME,
                    amount: {
                        currency_code: CONFIG.PRODUCT.CURRENCY,
                        value: CONFIG.PRODUCT.PRICE
                    }
                }]
            });
        },

        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                console.log('Transaction completed by ' + details.payer.name.given_name);
                showSuccessMessage(details.payer.name.given_name);
                simulateDigitalDelivery();
            });
        },

        onError: function (err) {
            console.error('PayPal Error:', err);
            alert('Hubo un error procesando el pago. Por favor intenta nuevamente.');
        },

        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
        }
    }).render('#paypal-button-container');
}

function showPayPalError(msg) {
    const container = document.getElementById('paypal-button-container');
    if (container) {
        container.innerHTML = `<p class="text-red-500 text-sm text-center">${msg}</p>`;
    }
}

function showSuccessMessage(name) {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = `
        <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <svg class="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h3 class="text-green-800 font-bold text-lg">¡Pago Exitoso!</h3>
            <p class="text-green-600 text-sm mt-1">Gracias ${name}.</p>
            <p class="text-gray-500 text-xs mt-2">Tu guía se está descargando...</p>
        </div>
    `;
}

/* 5. Simulate Digital Delivery */
function simulateDigitalDelivery() {
    setTimeout(() => {
        // Create a dummy link to trigger download
        const link = document.createElement('a');
        link.href = '#'; // In a real app, this would be the secure PDF URL
        link.download = 'Guia_Jammer_Bluetooth_v2.pdf';
        document.body.appendChild(link);
        // link.click(); // Uncomment to actually try to trigger click
        document.body.removeChild(link);

        console.log('Simulating PDF download...');
        alert('¡Descarga iniciada! Revisa también tu correo electrónico.');
    }, 1500);
}
