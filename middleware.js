module.exports = function(db){
    return{
        requireAuthentication:function(req,res,next){
            var token = req.get('Auth');
            console.log("inside middleware" + token);
            db.user.findByToken(token).then(function(user){
                req.user = user;
                next();
            },function(err){
                //stop here
                res.status(401).send();
            });
        }
    };
}