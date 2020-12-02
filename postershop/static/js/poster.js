const bagBtn = document.querySelector('.poster-bag-btn');
const mainImg = document.getElementById('main-img');
const select = document.getElementById('select-type')
const titleDom = document.getElementById('poster-title');
const queryTitle = titleDom.dataset.queryTitle;
const buyNowBtn = document.querySelector('.poster-now-btn');

document.addEventListener("DOMContentLoaded", () => {
    selectImageOption();
})

bagBtn.addEventListener('click', () => {
    let selectedType = select.value;
    getPoster(queryTitle).then(data => {
        return JSON.parse(data);
    }).then(poster => {
        if (selectedType == 'choose') {
            chooseSizePoster(queryTitle);
        }
        else {
            if (selectedType == poster.large['type']) {
                bagNumbers(poster.large);
                totalCost(poster.large['price']);
                displayPostersInBag();
            }
            if (selectedType == poster.medium['type']) {
                bagNumbers(poster.medium);
                totalCost(poster.medium['price']);
                displayPostersInBag();

            }
            if (selectedType == poster.small['type']) {
                bagNumbers(poster.small);
                totalCost(poster.small['price']);
                displayPostersInBag();

            }
        }
    })
})

buyNowBtn.addEventListener('click', () => {
    let selectedType = select.value;
    getPoster(queryTitle).then(data => {
        return JSON.parse(data);
    }).then(poster => {
        if (selectedType == 'choose') {
            chooseSizePoster(queryTitle);
        }
        if (selectedType == 'small') {
            let object = poster.small
            object["in_bag"] = 1
            console.log(object["in_bag"]);
            let obj = { [poster.small["bag_title"]]: object };
            buyNowCheckout(obj)
        }
        if (selectedType == 'medium') {
            let object = poster.medium
            object["in_bag"] = 1
            console.log(object["in_bag"]);
            let obj = { [poster.medium["bag_title"]]: object };
            buyNowCheckout(obj)
        }
        if (selectedType == 'large') {
            let object = poster.large;
            object["in_bag"] = 1;
            console.log(object["in_bag"]);
            let obj = { [poster.large["bag_title"]]: object };
            buyNowCheckout(obj);
        }
    })
})

function chooseSizePoster(title) {
    let chooseDiv = document.querySelector('.select-selected');
    setTimeout(function () {
        // chooseDiv.style.backgroundColor = 'rgba(198, 221, 236, 0.248)'
        chooseDiv.style.backgroundImage = 'linear-gradient(to bottom right, rgba(198, 221, 236, 0.748), rgba(198, 221, 236, 0.348), rgba(198, 221, 236, 0.018))';
        chooseDiv.style.boxShadow = 'inset 0 0 20px rgb(198, 221, 236)';
    }, 50);
    setTimeout(function () {
        // chooseDiv.style.backgroundColor = 'white'
        chooseDiv.style.backgroundImage = 'none';
        chooseDiv.style.boxShadow = 'none';
    }, 1400);
}





function displayImage(imgSrc) {
    mainImg.src = imgSrc;
}

function selectImageOption() {
    let posterImages = document.querySelectorAll('.poster-tumbnail-img')
    for (let i = 0; i < posterImages.length; i++) {
        posterImages[i].addEventListener('click', () => {
            displayImage(posterImages[i].src);
        })
    }
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
////////////// PREVIEW SECTION BEGINS HERE ///////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const previewSectionDOM = document.querySelector(".preview-section")
let ptu = document.getElementById('poster-title').innerHTML;
let ptc = ptu.slice(8)
let pt = parseInt(ptc)

document.addEventListener("DOMContentLoaded", () => {
    getPreviewPosters()
        .then(posters => {
            return JSON.parse(posters)
        })
        .then(posters => {
            if (pt == posters.length) {
                // console.log('should pick three below .length');
                let num1 = posters.length - 5;
                let num2 = posters.length - 4;
                let num3 = posters.length - 3;
                let num4 = posters.length - 2;
                displayPreviewPosters(posters[num1])
                displayPreviewPosters(posters[num2])
                displayPreviewPosters(posters[num3])
                displayPreviewPosters(posters[num4])

            }
            else if (pt == 1) {
                // console.log('should pick three above 1');
                let num1 = 1;
                let num2 = 2;
                let num3 = 3;
                let num4 = 4;
                displayPreviewPosters(posters[num1])
                displayPreviewPosters(posters[num2])
                displayPreviewPosters(posters[num3])
                displayPreviewPosters(posters[num4])
            }
            else {
                // console.log('should pick three different from present');
                if (pt == posters.length - 1) {
                    console.log(posters);
                    let length = posters.length;
                    let num1 = pt - 4;
                    let num2 = pt - 3;
                    let num3 = pt - 2;
                    let num4 = length - 1;
                    displayPreviewPosters(posters[num1])
                    displayPreviewPosters(posters[num2])
                    displayPreviewPosters(posters[num3])
                    displayPreviewPosters(posters[num4])
                }
                else if (pt == 2) {
                    let num1 = 0;
                    let num2 = 2;
                    let num3 = 3;
                    let num4 = 4;
                    displayPreviewPosters(posters[num1])
                    displayPreviewPosters(posters[num2])
                    displayPreviewPosters(posters[num3])
                    displayPreviewPosters(posters[num4])
                }
                else if (pt == 3) {
                    let num1 = pt - 3;
                    let num2 = pt - 2;
                    let num3 = pt;
                    let num4 = pt + 1;
                    displayPreviewPosters(posters[num1])
                    displayPreviewPosters(posters[num2])
                    displayPreviewPosters(posters[num3])
                    displayPreviewPosters(posters[num4])
                }
                else {
                    let num1 = pt - 3;
                    let num2 = pt - 2;
                    let num3 = pt;
                    let num4 = pt + 1;
                    displayPreviewPosters(posters[num1])
                    displayPreviewPosters(posters[num2])
                    displayPreviewPosters(posters[num3])
                    displayPreviewPosters(posters[num4])
                }
            }
        })
        .catch(error => {
            console.log('Error:', error);
        })
})

async function getPreviewPosters() {
    let result = await fetch(`${window.origin}/getposters`);
    let data = await result.json();
    return data;
}

function displayPreviewPosters(poster) {
    let result = "";
    let title = poster.title;
    let small = JSON.parse(poster.small)
    let large = JSON.parse(poster.large)
    result += `
                <div class="preview-poster">
                            <a href="/poster/${title}">
                                <img class='preview-poster-img' src='${poster.image}'/>
                            </a>
                        <div class="preview-poster-info">
                            <h1 class="posters-title">${poster.display_title}</h1>
                            <large class="posters-price">€${small.price} - €${large.price}</large>
                        </div>
                </div>
            `;
    previewSectionDOM.innerHTML += result;
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////// CUSTOM SELECT SECTION BEGINS HERE ///////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    /* For each element, create a new DIV that will act as the selected item: */
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /* For each element, create a new DIV that will contain the option list: */
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
        /* For each option in the original select element,
        create a new DIV that will act as an option item: */
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function (e) {
            /* When an item is clicked, update the original select box,
            and the selected item: */
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
                if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                        y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    break;
                }
            }
            h.click();
        });
        b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function (e) {
        /* When the select box is clicked, close any other select boxes,
        and open/close the current select box: */
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}

function closeAllSelect(elmnt) {
    /* A function that will close all select boxes in the document,
    except the current select box: */
    var x, y, i, xl, yl, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < xl; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);