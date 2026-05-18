module.exports = (req, res, next) => {
    if (req.cookies.username) {
        return next(); 
    }else{
    return res.redirect('/register');
    }
};