let express = require('express')
let app = express()
let mysql = require('mysql')
let con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'market'
})

app.use(express.static('public'))
app.set('view engine', 'pug')



app.listen(3000, function () {
    console.log('work on 3000')
})

app.get('/', (req, res) => {
    con.query(
        'SELECT * FROM goods',
        function (error, result) {
            if (error) throw error;
            let goods = {}
            result.map(good => { goods[good['id']] = good })
            res.render('main', {
                goods: JSON.parse(JSON.stringify(goods))
            })
        }

    )

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