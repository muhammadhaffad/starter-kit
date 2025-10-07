export function getPages(curr_page, last_page) {
    const start = Math.max(curr_page - 3, 1);
    const end = Math.min(curr_page + 3, last_page);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function updateQueryParams(uri, key, value) {
    const url = new URL(uri || window.location.href);
    if (url.searchParams.has(key)) {
        url.searchParams.set(key, value);
    } else {
        url.searchParams.append(key, value);
    }
    return url.toString();
}

export function getQueryParams(key) {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
}