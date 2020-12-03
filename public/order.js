document.querySelector('#shop-order').onsubmit = (event) => {
    event.preventDefault()
    let username = document.querySelector('#username').value.trim()
    let phone = document.querySelector('#phone').value.trim()
    let email = document.querySelector('#email').value.trim()
    let address = document.querySelector('#address').value.trim()
    if (!document.querySelector('#rule').checked) {
        swal({
            title: 'Warning',
            text: 'Read and accept the rule',
            buttons: {
                confirm: {
                    text: 'OKK'
                }
            }
        })
        return false
    }
    if (username == '' || phone == '' || email == '' || address == '') {
        swal({
            title: 'Warning',
            text: 'fill all fields',
            buttons: {
                confirm: {
                    text: 'OKK'
                }
            }
        })
        return false
    }
    fetch('/finish-order', {
        method: 'POST',
        body: JSON.stringify({
            'username': username,
            'phone': phone,
            'email': email,
            'address': address,
            'key': JSON.parse(localStorage.getItem('cart'))
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => response.text())
        .then(body => {
            if (body == 'OK') {
                swal({
                    title: 'Success',
                    text: 'order is finished',
                    buttons: {
                        confirm: {
                            text: 'OKK'
                        }
                    }
                })
                return false
            } else {
                swal({
                    title: 'problem with server',
                    text: 'error',
                    buttons: {
                        confirm: {
                            text: 'OKK'
                        }
                    }
                })
                return false
            }
        })
}