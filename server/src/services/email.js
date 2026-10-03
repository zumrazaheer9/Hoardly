import { config } from '../config/env.js';

export async function sendOrderConfirmationEmail(email, order) {
	if (!config.resendApiKey || !config.orderConfirmationFrom || !email) return;

	const safeOrderNumber = String(order.order_number).replace(/[&<>"']/g, (character) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	})[character]);
	const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.total));
	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${config.resendApiKey}`,
			'Content-Type': 'application/json',
		},
		signal: AbortSignal.timeout(5000),
		body: JSON.stringify({
			from: config.orderConfirmationFrom,
			to: [email],
			subject: `Hoardly order ${safeOrderNumber} confirmed`,
			html: `<p>Your order <strong>${safeOrderNumber}</strong> has been placed.</p><p>Total: ${formattedTotal}</p><p>Payment method: Cash on delivery.</p>`,
		}),
	});

	if (!response.ok) throw new Error(`Email provider returned ${response.status}.`);
}