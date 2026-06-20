module.exports = (request, response, next) => {
    if (request.cookies.username) {
        next();
    } else {
        return response.status(401).json({
            error: "Usuario no autenticado"
        });
    }
};