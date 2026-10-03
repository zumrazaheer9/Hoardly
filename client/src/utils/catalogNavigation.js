export function productSearchUrl(value, currentSearch = '') {
  const params = new URLSearchParams(currentSearch);
  const query = value.trim();
  if (query) params.set('search', query);
  else params.delete('search');
  params.delete('page');
  return `/products${params.size ? `?${params}` : ''}`;
}
