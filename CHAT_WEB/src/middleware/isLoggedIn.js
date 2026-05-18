module.exports = (req,res,next) => { //parametro next permite dar una accon despues del request y el response, next continua con el proceso de ir al chat 
    if(req.cookies.username){
        next();
    }else{
        res.redirect("/register")
    }
};