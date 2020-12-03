let express = require('express')
let app = express()
let mysql = require('mysql')
let con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'market'
})
const nodemailer = require('nodemailer')

app.use(express.static('public'))
app.set('view engine', 'pug')

app.use(express.json())



app.listen(3000, function () {
    console.log('work on 3000')
})

app.get('/', (req, res) => {
    let cat = new Promise((resolve, reject) => {
        con.query("select id,name, cost, image, category from (select id,name,cost,image,category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind   from goods, ( select @curr_category := '' ) v ) goods where ind < 3", function (error, result, field) {
            if (error) return reject(error)
            resolve(result)
        })
    })
    let catDescription = new Promise((resolve, reject) => {
        con.query("select * from category", function (error, result, field) {
            if (error) return reject(error)
            resolve(result)
        })
    })
    Promise.all([cat, catDescription]).then(value => {

        res.render('index', {
            goods: JSON.parse(JSON.stringify(value[0])),
            cat: JSON.parse(JSON.stringify(value[1]))
        })
    })
})

app.get('/cat', (req, res) => {
    let catId = req.query.id
    let cat = new Promise((res, rej) => {
        con.query('SELECT * FROM category WHERE id=' + catId,
            (error, result) => {
                if (error) rej(error)
                res(result)
            })
    })
    let goods = new Promise((res, rej) => {
        con.query('SELECT * FROM goods WHERE category=' + catId,
            (error, result) => {
                if (error) rej(error)
                res(result)
            })
    })
    Promise.all([cat, goods]).then((value) => {
        res.render('cat', {
            goods: JSON.parse(JSON.stringify(value[1])),
            cat: JSON.parse(JSON.stringify(value[0])),
        })
    })
})
app.get('/goods', (req, res) => {
    con.query('SELECT * FROM goods WHERE id=' + req.query.id, (error, result) => {
        if (error) throw error
        res.render('goods', { goods: JSON.parse(JSON.stringify(result)) })
    })
}
)
app.post('/get-category-list', (req, res) => {
    con.query('SELECT id, category FROM category', (error, result) => {
        if (error) throw error
        res.json(result)
    })
}
)

app.post('/get-goods-info', (req, res) => {
    if (req.body.key.length != 0) {
        con.query(`SELECT id,name,cost FROM goods WHERE id IN (${req.body.key.join(',')})`, (error, result) => {
            if (error) throw error
            let goods = {}
            for (let i = 0; i < result.length; i++) {
                goods[result[i]['id']] = result[i]
            }
            res.json(goods)
        })
    } else res.send('0')
}
)

app.get('/order', (req, res) => {
    res.render('order')
}
)

app.post('/finish-order', (req, res) => {
    if (req.body.key.length !== 0) {
        let key = Object.keys(req.body.key)
        con.query(`SELECT id,name,cost FROM goods WHERE id IN (${key.join(',')})`, (error, result, fields) => {
            if (error) throw error
            sendmail(req.body, result).catch(console.error)
            saveOrder(req.body, result)
            res.send('OK')
        })
    } else {
        res.send('Bad')
    }

})

async function sendmail(data, result) {
    let res = '<h2>Order </h2>'
    let total = 0
    for (let i = 0; i < result.length; i++) {
        res += `<p> ${result[i]['name']} - ${data.key[result[i]['id']]} - ${result[i]['cost'] * data.key[result[i]['id']]} Rub </p>`
        total += result[i]['cost'] * data.key[result[i]['id']]
    }
    res += '< /hr>'
    res += `Total ${total} rub`
    res += `<p> Phone: ${data.phone}`
    res += `<p> Name: ${data.username}`
    res += `<p> address: ${data.address}`
    res += `<p> email: ${data.email}`

    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    let mailOptions = {
        from: '"Fred Foo 👻" <foo@example.com>',
        to: "bar@example.com, baz@example.com",
        subject: 'Shop order',
        text: ' you bought this stuff',
        html: res
    }

    let info = await transporter.sendMail(mailOptions)
}

function saveOrder(data, result) {
    let sql = `INSERT INTO user_info (user_name, user_phone, user_email, address) VALUES ('${data.username}', '${data.phone}', '${data.email}', '${data.address}')`

    con.query(sql, function (error, resultQuery) {
        if (error) throw error
        let userId = resultQuery.insertId
        let date = new Date() / 1000
        let arr = []
        let obj = {
            ids: [],
            cost: [],
            total: () => {
                let summary = 0
                for (let i = 0; i < result.length; i++) {
                    summary += result[i]['cost'] * data.key[result[i]['id']]
                }
                return summary
            }
        }
        result.map((el, index) => {
            obj.ids = [...obj.ids, el.id],
                obj.cost = [...obj.cost, el.cost]
            arr = [...arr, [date, userId, el.id, el.cost, data.key[el.id], obj.total()]]
        })
        sql = `INSERT INTO shop_order (date, user_id, goods_id, goods_cost,goods_amount, total) VALUES ?`
        con.query(sql, [arr], (error, resultQuery) => {
            if (error) throw error
        })
    })
}