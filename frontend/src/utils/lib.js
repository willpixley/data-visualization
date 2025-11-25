export function formatDate(dateString) {
	const date = new Date(dateString);
	if (isNaN(date)) return dateString; // fallback if invalid
	const options = { year: 'numeric', month: 'short', day: 'numeric' };
	return date.toLocaleDateString('en-US', options);
}
