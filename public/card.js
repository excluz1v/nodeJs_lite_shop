let card = {}
let addToCard = document.querySelectorAll('.add-to-card')

addToCard.forEach(el => {
    el.onclick = function () {
        let goodsId = this.dataset.good_id
        if (card[goodsId]) card[goodsId]++
        else card[goodsId] = 1
        getGoodsInfo()
    }
})

if (localStorage.getItem('cart')) {
    card = JSON.parse(localStorage.getItem('cart'))
    getGoodsInfo()
}


function getGoodsInfo() {
    updateLocalStorageCart()
    fetch('/get-goods-info', {
        method: 'POST',
        body: JSON.stringify({
            key: Object.keys(card)
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            return response.text()
        })
        .then(body => { showCart(JSON.parse(body)) })
}

function showCart(data) {
    let out = '<table class="table table-stripped table-cart"><tbody>'
    let total = 0;
    for (let key in card) {
        out += `<tr><td colspan="4"><a href="/goods?id=${key}">${data[key]['name']}</a></tr>`;
        out += `<tr><td><i class="far fa-minus-square cart-minus" data-good_id="${key}"></i></td>`;
        out += `<td>${card[key]}</td>`;
        out += `<td><i class="far fa-plus-square cart-plus" data-good_id="${key}"></i></td>`;
        out += `<td>${data[key]['cost'] * card[key]} uah </td>`
        out += '</tr>';
        total += card[key] * data[key]['cost'];
    }
    out += `<tr><td colspan="3">Total: </td><td>${total} RUB</td></tr>`;
    out += '</tbody></table>'
    document.querySelector('.busket').innerHTML = out
    document.querySelectorAll('.cart-minus').forEach(function (element) {
        element.onclick = cartMinus;
    });
    document.querySelectorAll('.cart-plus').forEach(function (element) {
        element.onclick = cartPlus;
    });
}

function updateLocalStorageCart() {
    localStorage.setItem('cart', JSON.stringify(card))
}

function cartPlus() {
    let goodsId = this.dataset.good_id;
    card[goodsId]++;
    getGoodsInfo();
}

function cartMinus() {
    let goodsId = this.dataset.good_id;
    if (card[goodsId] - 1 > 0) {
        card[goodsId]--;
    }
    else {
        delete (card[goodsId]);
    }
    getGoodsInfo();
}