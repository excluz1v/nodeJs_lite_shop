module.exports = function (req, res, con, next) {
    if (!req.cookies.hash || !req.cookies.id) {
        res.redirect('/login')
        return false
    }
    con.query(`SELECT * FROM admins WHERE id = "${req.cookies.id}" and hash = "${req.cookies.hash}"`, (error, result) => {
        if (error) throw error
        console.log(result)
        if (result.length === 0) {
            res.redirect('/login')
        } else next()
    })

}