require('dotenv').config();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const fetchuser = (req,res,next)=>{
    try{
        const token = req.header('auth-token');
        if(!token){
        return res.status(401).send({error: 'Authenticate using a valid token'});
        }
        const data = jwt.verify(token,secret);
        req.user = data;
        next();

    }catch(err){
        res.status(400).json({error:err.message});   
    }
}
module.exports = fetchuser;