function clearLocalStorage() {
    localStorage.removeItem('total-cost');
    localStorage.removeItem('items-in-bag');
    localStorage.removeItem('bag-numbers');
}

document.addEventListener("DOMContentLoaded", () => {
    clearLocalStorage();
})