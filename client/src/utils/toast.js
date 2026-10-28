export const toast = (message, type = 'success') => window.dispatchEvent(new CustomEvent('toast', { detail: { message, type, id: Math.random() } }));
