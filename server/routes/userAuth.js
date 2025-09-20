require('dotenv').config();
const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {body,validationResult} = require('express-validator');
const secret = process.env.JWT_SECRET;

const router = express.Router();


//User Sign-in
router.post('/sign-in',[
    body('username').exists(),
    body('email').isEmail(),
    body("password").isLength({min:8})
],async(req,res)=>{
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    try{
        const {username,email,password} = req.body;
        const chkEmail = await User.findOne({email});
        if(chkEmail){
            return res.status(400).json({error:"Email already Registered"});
        }
        const secPass = await bcrypt.hash(password,10);
        const newUser = new User({
            username,email,
            password:secPass
        })

        await newUser.save();
        const data = {
            id:newUser.id
        }
        const token = jwt.sign(data,secret);
        res.status(200).send(token);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

//User log-in
router.post('/log-in',[
    body('email', "Enter your email ").isEmail(),
    body("password","Enter a Strong password").isLength({min:8})
],async(req,res)=>{
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Email Not Registered"});
        }
        const compPass = await bcrypt.compare(password,user.password);
        if(!compPass){
            return res.status(400).json({error:"Invalid Credentials!!!"});
        }

        const data = {
            id:user.id
        }

        const token  = jwt.sign(data,secret);

        res.status(200).send(token);
    }catch(err){
        res.status(400).json({error:err.message});
    }
})

module.exports = router;