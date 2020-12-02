const menuIcon = document.querySelector('.hamburger-menu');
const navbar = document.querySelector('.nav-list');
const bagLogo = document.querySelector('.bag-logo');

menuIcon.addEventListener('click', () => {
    navbar.classList.toggle('change');
    menuIcon.classList.toggle('burger-change');
    bagLogo.classList.toggle('bag-change');
});

document.addEventListener("DOMContentLoaded", () => {
    onLoadBagNumbers();
})

function onLoadBagNumbers() {
    let numbersInBag = JSON.parse(localStorage.getItem('bag-numbers'));
    if (numbersInBag != null) {
        document.querySelector('.bag-logo span').textContent = numbersInBag;
        bagLogo.style.marginRight = "50px"
    }
    else {
        document.querySelector('.bag-logo span').textContent = '';
    }
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
////////////// CONSENT SECTION BEGINS HERE ///////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const consentPropertyName = 'cookie_consent';
const consentDOM = document.getElementById('consent-popup');
const acceptAnchor = document.getElementById('accept');
const acceptBtn = document.getElementById('consent-popup-btn')

const shouldShowPopup = () => !localStorage.getItem(consentPropertyName);
const saveToStorage = () => localStorage.setItem(consentPropertyName, true);

document.addEventListener("DOMContentLoaded", () => {
    if (shouldShowPopup()) {
        acceptBtn.addEventListener('click', () => {
            saveToStorage();
            consentDOM.style.display = 'none';
            acceptBtn.style.display = 'none';
        })
    }
    else {
        consentDOM.style.display = 'none';
        acceptBtn.style.display = 'none';
    }
})

var stripe = Stripe('pk_test_MOyMACBQrOfIPtVdtUEN0Hvz006Qegfcre'); // this should be the pk api key and should be set in a variable.

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
////////////// 'CHECKOUT' SECTION BEGINS HERE ////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const checkoutBtn = document.querySelector('.checkout-button');

checkoutBtn.addEventListener('click', function () {
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:
            localStorage.getItem('items-in-bag')
        ,
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (session) {
            return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .then(function (result) {
            // If `redirectToCheckout` fails due to a browser or network
            // error, you should display the localized error message to your
            // customer using `error.message`.
            if (result.error) {
                alert(result.error.message);
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
});

function buyNowCheckout(obj) {
    fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:
            JSON.stringify(obj)
        ,
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (session) {
            return stripe.redirectToCheckout({ sessionId: session.id });
        })
        .then(function (result) {
            // If `redirectToCheckout` fails due to a browser or network
            // error, you should display the localized error message to your
            // customer using `error.message`.
            if (result.error) {
                alert(result.error.message);
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
////////////// ADD TO BAG SECTION BEGINS HERE ////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

async function getPoster(queryTitle) {
    obj = {}
    let response = await fetch(`${window.origin}/getposter`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(queryTitle),
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    })
    let result = await response.json()
    return `{${result}}`
}

function bagNumbers(poster) {
    let numbersInBag = JSON.parse(localStorage.getItem('bag-numbers'));
    let bagLogo = document.querySelector('.bag-logo');
    if (numbersInBag != null) {
        localStorage.setItem('bag-numbers', numbersInBag + 1);
        document.querySelector('.bag-logo span').textContent = numbersInBag + 1;
    }
    else {
        localStorage.setItem('bag-numbers', 1);
        document.querySelector('.bag-logo span').textContent = 1;
        bagLogo.style.marginRight = "50px"
    }
    setItems(poster);
}

function setItems(poster) {
    let itemsInBag = JSON.parse(localStorage.getItem('items-in-bag'));
    if (itemsInBag != null) {
        if (itemsInBag[poster.bag_title] == undefined) {
            itemsInBag = {
                ...itemsInBag, // this 'expands' the array letting items in
                [poster.bag_title]: poster // this adds item to bag
            }
        }
        itemsInBag[poster.bag_title].in_bag += 1; // this just adds count because 
        // item is already in bag.
    }
    else {
        poster.in_bag = 1;
        itemsInBag = {
            [poster.bag_title]: poster
        }
    }
    localStorage.setItem('items-in-bag', JSON.stringify(itemsInBag));
}

function totalCost(price) {
    let costTotal = JSON.parse(localStorage.getItem('total-cost'));
    if (costTotal != null) {
        localStorage.setItem('total-cost', costTotal += price);
    }
    else {
        localStorage.setItem('total-cost', price)
    }
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
///////// BAG FUNCTIONALITY SECTION BEGINS HERE //////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const bagOverlay = document.querySelector('.bag-overlay');
const bagDiv = document.querySelector('.bag-div');
const bagBody = document.querySelector('.bag-body');
const bagPosters = document.querySelector('.bag-posters');
const bagFooter = document.querySelector('.bag-footer');
const clearBagBtn = document.querySelector('.clear-bag-button');
const closeLogos = document.querySelectorAll('.close-bag');
const emptyOverlay = document.querySelector('.empty-bag-overlay');
const emptyBag = document.querySelector('.empty-bag');

let totalCostSpan = document.querySelector('.total-cost span');
let postersInBag = JSON.parse(localStorage.getItem('items-in-bag'));

let numbersInBag = JSON.parse(localStorage.getItem('bag-numbers'));

bagLogo.addEventListener('click', () => {
    displayPostersInBag();
    showBag();

});

for (let i = 0; i < closeLogos.length; i++) {
    closeLogos[i].addEventListener('click', () => {
        closeBag()
    })
}

function closeBag() {
    bagOverlay.style.left = '-100vw'
    bagDiv.style.right = '-100vw'
    emptyBag.style.right = '-100vw'
    emptyOverlay.style.left = '-100vw'
}

clearBagBtn.addEventListener('click', () => {
    clearBag();
});

async function showBag() {
    let postersInBag = await JSON.parse(localStorage.getItem('items-in-bag'));
    if (postersInBag) {
        if (screen.width > 668) {
            bagOverlay.style.left = '0'
        }
        bagDiv.style.right = '0'
        bagOverlay.addEventListener('click', () => {
            bagOverlay.style.left = '-100vw'
            bagDiv.style.right = '-100vw'
        });
    }
    else {
        if (screen.width > 668) {
            emptyOverlay.style.left = '0'
        }

        emptyBag.style.right = '0'
        emptyOverlay.addEventListener('click', () => {
            emptyOverlay.style.left = '-100vw'
            emptyBag.style.right = '-100vw'
        });
    }
}

function getButtons() {
    let plusButtons = document.querySelectorAll('.plus')
    for (let i = 0; i < plusButtons.length; i++) {
        plusButtons[i].addEventListener('click', () => {
            addItemCount(plusButtons[i].dataset.poster_t);
        })
    }
    let minusButtons = document.querySelectorAll('.minus')
    for (let i = 0; i < minusButtons.length; i++) {
        minusButtons[i].addEventListener('click', () => {
            removeItems(minusButtons[i].dataset.poster_title);
        })
    }
    let removeButtons = document.querySelectorAll('.remove-btn')
    for (let i = 0; i < removeButtons.length; i++) {
        removeButtons[i].addEventListener('click', () => {
            posterTitle = removeButtons[i].dataset.rmId
            let inBag = JSON.parse(localStorage.getItem('items-in-bag'))
            let quantity = inBag[posterTitle].in_bag
            let preAmount = inBag[posterTitle].price
            let amount = quantity * preAmount
            removeItemFromBag(posterTitle);
            removeWhenZero(posterTitle)
            removeFromBagNumbers(quantity)
            removeFromTotalCost(amount)
            clearLast()
        })
    }
}

async function displayPostersInBag() {
    let postersInBag = await JSON.parse(localStorage.getItem('items-in-bag'));
    let result = '';
    if (postersInBag) {
        Object.values(postersInBag).map(poster => {
            result += `
                <div class="bag-poster" id="poster-${poster.bag_title}">
                    <div class="bag-poster-content">
                            <a href="/poster/${poster.title}">
                                <img class="bag-poster-img" src='${poster.image}'/>  
                            </a>
                        <div class="bag-poster-info">
                            <h1>${poster.display_title}</h1>
                            <h3>${poster.size}</medium>
                            <h3>€${poster.price}</h3>
                            <div class="bag-poster-controller">
                                <img class="minus" data-poster_title="${poster.bag_title}" src="/static/icons/minus.svg"></i>
                                <span class="poster-bag-amount" id="poster-bag-amount-${poster.bag_title}" data-p_title="${poster.bag_title}">${poster.in_bag}</span>
                                <img class="plus" data-poster_t="${poster.bag_title}" src="/static/icons/plus.svg"></i>
                                <small data-rm-id="${poster.bag_title}" class="remove-btn">Remove</small>
                            </div>                            
                        </div>
                    </div>
                </div>
                `
        });
        let getTotalCost = JSON.parse(localStorage.getItem('total-cost'));
        emptyBag.remove();
        bagPosters.innerHTML = result;
        bagFooter.style.display = 'block';
        totalCostSpan.textContent = '€' + getTotalCost;
        showBag();
        getButtons();
    }
}

function checkBagNumbers() {
    let numbersInBag = JSON.parse(localStorage.getItem('bag-numbers'))
    return numbersInBag
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/////////// ADD TO BAG (INBAG) SECTION BEGINS HERE ///////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

function addItemCount(poster_title) {
    let itemsInBag = JSON.parse(localStorage.getItem('items-in-bag'));
    if (itemsInBag != null) {
        itemsInBag[poster_title].in_bag = itemsInBag[poster_title].in_bag += 1;
        let posterBagAmountDOMS = document.querySelectorAll('.poster-bag-amount');
        for (let i = 0; i < posterBagAmountDOMS.length; i++) {
            if (posterBagAmountDOMS[i].dataset.p_title == poster_title) {
                document.querySelector('#poster-bag-amount-' + poster_title).textContent = itemsInBag[poster_title].in_bag;
            }
        }
        raiseTotalCost(poster_title);
        increaseBagNumbers();
        localStorage.setItem('items-in-bag', JSON.stringify(itemsInBag))
    }
}

function increaseBagNumbers() {
    let bagNumbers = JSON.parse(localStorage.getItem('bag-numbers'));
    let bagSpan = document.querySelector('.bag-logo span');
    if (bagNumbers > 0) {
        localStorage.setItem('bag-numbers', bagNumbers + 1)
        bagSpan.textContent = JSON.parse(localStorage.getItem('bag-numbers'));
    }
}

function raiseTotalCost(poster_title) {
    let costTotal = JSON.parse(localStorage.getItem('total-cost'));
    let itemsInBag = JSON.parse(localStorage.getItem('items-in-bag'))
    let storagePoster = itemsInBag[poster_title]
    localStorage.setItem('total-cost', costTotal += storagePoster.price);
    document.querySelector('.total-cost span').textContent = '€' + costTotal;
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
///////// REMOVE FROM BAG (INBAG) SECTION BEGINS HERE ////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

function removeItems(poster_title) {
    let itemSpan = document.querySelector('.poster-bag-amount');
    let itemsInBag = JSON.parse(localStorage.getItem('items-in-bag'));
    if (itemsInBag != null) {
        itemsInBag[poster_title].in_bag = itemsInBag[poster_title].in_bag - 1;
        decreaseBagNumbers();
        lowerTotalCost(poster_title);
        if (itemsInBag[poster_title].in_bag == 0) {
            let title = itemsInBag[poster_title].bag_title;
            removeItemFromBag(title);
            removeWhenZero(title);
            clearLast();
        }
        else {
            localStorage.setItem('items-in-bag', JSON.stringify(itemsInBag))
            let posterBagAmountDOMS = document.querySelectorAll('.poster-bag-amount');
            for (let i = 0; i < posterBagAmountDOMS.length; i++) {
                if (posterBagAmountDOMS[i].dataset.p_title == poster_title) {
                    document.querySelector('#poster-bag-amount-' + poster_title).textContent = itemsInBag[poster_title].in_bag;
                }
            }
        }
    }
}

function removeItemFromBag(title) {
    let bagItem = JSON.parse(localStorage.getItem('items-in-bag'));
    delete bagItem[title];
    localStorage.setItem('items-in-bag', JSON.stringify(bagItem));
}

function decreaseBagNumbers() {
    let bagNumbers = JSON.parse(localStorage.getItem('bag-numbers'));
    let bagSpan = document.querySelector('.bag-logo span');
    if (bagNumbers > 0) {
        localStorage.setItem('bag-numbers', bagNumbers - 1)
        bagSpan.textContent = JSON.parse(localStorage.getItem('bag-numbers'));
    }
}

function lowerTotalCost(poster_title) {
    let costTotal = JSON.parse(localStorage.getItem('total-cost'));
    let itemsInBag = JSON.parse(localStorage.getItem('items-in-bag'))
    let storagePoster = itemsInBag[poster_title]
    localStorage.setItem('total-cost', costTotal -= storagePoster.price);
    document.querySelector('.total-cost span').textContent = '€' + costTotal;
}

function removeWhenZero(title) {
    let posterDOM = document.querySelector('#poster-' + title)
    posterDOM.remove();
}

function removeFromBagNumbers(quantity) {
    let bagNumbers = JSON.parse(localStorage.getItem('bag-numbers'));
    let bagSpan = document.querySelector('.bag-logo span');
    if (bagNumbers > 0) {
        localStorage.setItem('bag-numbers', bagNumbers - quantity)
        bagSpan.textContent = JSON.parse(localStorage.getItem('bag-numbers'));
    }
}

function removeFromTotalCost(amount) {
    let costTotal = JSON.parse(localStorage.getItem('total-cost'));
    localStorage.setItem('total-cost', costTotal -= amount);
    document.querySelector('.total-cost span').textContent = '€' + costTotal;
}

function clearLast() {
    itemsInBag = JSON.parse(localStorage.getItem('items-in-bag'))
    if (isEmpty(itemsInBag) == true) {
        clearBag();
    }
}

function clearBag() {
    localStorage.removeItem('bag-numbers');
    localStorage.removeItem('items-in-bag');
    localStorage.removeItem('total-cost');
    bagBody.innerHTML = ''
    bagFooter.innerHTML = ''
    document.querySelector('.bag-logo span').textContent = '';
    bagLogo.style.marginRight = "30px"
    setInterval(location.reload.bind(location), 200)
}

