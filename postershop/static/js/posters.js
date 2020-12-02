const postersDOM = document.querySelector(".posters-container")

document.addEventListener("DOMContentLoaded", () => {
    getPosters()
        .then(posters => {
            return JSON.parse(posters)
        })
        .then(posters => {
            displayPosters(posters);
            getCardBagButtons();
            getNowButtons();
        })
        .catch(error => {
            console.log('Error:', error);
        })
})

async function getPosters() {
    let result = await fetch(`${window.origin}/getposters`);
    let data = await result.json();
    return data;
}

function displayPosters(posters) {
    let result = "";
    posters.forEach(poster => {
        let title = poster.title;
        let small = JSON.parse(poster.small)
        let medium = JSON.parse(poster.medium)
        let large = JSON.parse(poster.large)
        result += `
                    <div class="poster">
                        <div class="card">
                            <div class="front">
                                <div class="front-content">
                                        <a href="/poster/${title}">
                                            <img class='front-img' src='${poster.image}'/>
                                        </a>
                                    <div class="front-info">
                                        <h1 class="front-title">${poster.display_title}</h1>
                                        <large class="front-price">€${small.price} - €${large.price}</large>
                                    </div>
                                </div>
                            </div>

                            <div class="back">
                                <div class="back-content">
                                        <a href="/poster/${title}">
                                            <img class='back-img' src='${poster.image}'/>
                                        </a>
                                    <div class="back-info">
                                        <h1 class="back-title">${poster.display_title}</h1>
                                        <div class="card-select" data-select-title="${title}">     
                                                
                                                <input id="${small.bag_title}" name="${title}-size" value="small" type="radio">
                                                    <label for="${small.bag_title}" class="select-item">${small.size}<br>&euro;${small.price}</label>
                                                
                                                <input id="${medium.bag_title}" name="${title}-size" value="medium" type="radio">
                                                    <label for="${medium.bag_title}" class="select-item">${medium.size}<br>&euro;${medium.price}</label>

                                                <input id="${large.bag_title}" name="${title}-size" value="large" type="radio">
                                                    <label for="${large.bag_title}" class="select-item">${large.size}<br>&euro;${large.price}</label>
                                                
                                        </div>
                                    </div>
                                    <div class="card-buttons">
                                        <div data-card-title="${title}" class="card-btn card-bag">Add to bag</div>
                                        <div data-now-title="${title}" class="card-btn card-now">Buy now</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            `;
    });
    postersDOM.innerHTML = result;

}

function getCardBagButtons() {
    let cardBagButtons = document.querySelectorAll('.card-bag');
    for (let i = 0; i < cardBagButtons.length; i++) {
        cardBagButtons[i].addEventListener('click', () => {
            getPoster(cardBagButtons[i].dataset.cardTitle).then(data => {
                return JSON.parse(data);
            }).then(poster => {
                let checked = getRadioChecked(cardBagButtons[i].dataset.cardTitle);
                if (typeof (checked) == 'undefined') {
                    chooseSizePosters(cardBagButtons[i].dataset.cardTitle);
                }
                else {
                    if (checked == 'small') {
                        bagNumbers(poster.small);
                        totalCost(poster.small['price']);
                        displayPostersInBag();
                    }
                    if (checked == 'medium') {
                        bagNumbers(poster.medium);
                        totalCost(poster.medium['price']);
                        displayPostersInBag();
                    }
                    if (checked == 'large') {
                        bagNumbers(poster.large);
                        totalCost(poster.large['price']);
                        displayPostersInBag();
                    }
                }
            })

        })
    }
}

function getRadioChecked(title) {
    let cardBagRadio = document.getElementsByName(title + '-size');
    for (let i = 0; i < cardBagRadio.length; i++) {
        if (cardBagRadio[i].checked == true) {
            // console.log(cardBagRadio[i].value);
            return cardBagRadio[i].value;
        }
    }
}

function getNowButtons() {
    let buyNowButtons = document.querySelectorAll('.card-now');
    for (let i = 0; i < buyNowButtons.length; i++) {
        buyNowButtons[i].addEventListener('click', () => {
            let posterSize = getRadioChecked(buyNowButtons[i].dataset.nowTitle);
            buyNow(buyNowButtons[i].dataset.nowTitle, posterSize);
        })
    }
}
function chooseSizePosters(title) {
    let selectDiv = document.querySelectorAll('.card-select');
    for (let i = 0; i < selectDiv.length; i++) {
        if (title == selectDiv[i].dataset.selectTitle) {
            setTimeout(function () {
                selectDiv[i].style.backgroundImage = 'linear-gradient(to bottom right, rgba(198, 221, 236, 0.748), rgba(198, 221, 236, 0.348), rgba(198, 221, 236, 0.048))'

            }, 50);
            setTimeout(function () {
                selectDiv[i].style.backgroundImage = 'none'
            }, 1400);
        }
    }
}

const selectItems = document.querySelectorAll('.select-item');
let selectDiv = document.querySelectorAll('.card-select');
for (i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener('click', () => {

        selectDiv.style.backgroundImage = 'none'
    })
}

function buyNow(title, size) {
    getPoster(title).then(data => {
        return JSON.parse(data);
    }).then(poster => {
        if (typeof (size) == 'undefined') {
            chooseSizePosters(title);
        }
        if (size == 'small') {
            let object = poster.small
            object["in_bag"] = 1
            let obj = { [poster.small["bag_title"]]: object };
            buyNowCheckout(obj)
        }
        if (size == 'medium') {
            let object = poster.medium
            object["in_bag"] = 1
            let obj = { [poster.medium["bag_title"]]: object };
            buyNowCheckout(obj)
        }
        if (size == 'large') {
            let object = poster.large
            object["in_bag"] = 1
            let obj = { [poster.large["bag_title"]]: object };
            buyNowCheckout(obj)
        }
    })
}

