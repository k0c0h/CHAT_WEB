module.exports = (request, response, next) => {
    if (request.cookies.username) {
        next();
    } else {
        response.redirect("/register");
    }
};