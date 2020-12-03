function getCategoryList() {
    fetch('/get-category-list', {
        method: 'POST'
    }).then(response => response.text()).then(body => showCategoryList(JSON.parse(body)))
}

function showCategoryList(data) {
    let out = '<ul class="category-list"><li><a href="/">Main</li>'
    for (let i = 0; i < data.length; i++) {
        out += `<li><a href="/cat?id=${data[i]['id']}">${data[i]['category']} <a/></li>`
    }
    out += '</ul>'
    document.querySelector('.category-list').innerHTML = out
}
getCategoryList()

let closeNav = document.querySelector('.close-nav')
closeNav.onclick = function () {
    document.querySelector('.site-nav').style.left = '-300px'
}
let showNav = document.querySelector('.show-nav')
showNav.onclick = function () {
    document.querySelector('.site-nav').style.left = 'auto'
}