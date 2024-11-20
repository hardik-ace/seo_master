
// 'use strict';

module.exports = function requireAuth(req, res, next) {  
    if(req.session.customer && req.session.customer.id != '' && (req.path.startsWith('/auth') || req.path == "/" ) && req.path!='/auth/logout'){
        res.redirect("/dashboard");
    }else if (req.session.customer) {
        next();
    } else { 
        if(req.path.startsWith('/auth')){
            next();
        }else{
            res.redirect("/auth");
        }
    }
};