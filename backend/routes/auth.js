const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "Ahadisagoodboy";
// ROUTE 1 : Create a User using : POST "/api/auth/createuser" . Doesnt Require Auth - No login Required
router.post('/createuser',
[
    body('name',"Enter Valid Name").isLength({ min: 3 }),
    body('email',"Enter Valid Email").isEmail(),
    body('password',"Password must be at least 5 characters").isLength({ min: 5 }),
],
async (req, res)=>{
    //if there are errors return bad request and the errors
    let sucess =false

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ sucess,errors: errors.array() });
    }
    //Check whether the user with this email exisits already
    try {
    let user =await User.findOne({email:req.body.enail});
    if(user){
        return req.status(400).json({sucess,error : "Sorry ,  User with this email already exists"})
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password ,  salt);    //create a new user
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
    })
    //   .then(user => res.json(user))
    //   .catch(err=> {console.log(err)
    // res.json({error:'Please Enter  Unique Value for Email ', message : err.message})})
    const data = {
        user:{id:user.id}
    }
    const authtoken  = jwt.sign(data,JWT_SECRET);
    // console.log(jwtData);
    // res.json(user)
    sucess=true
    res.json({sucess,authtoken})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error Occured");
    }
})
// ROUTE 2 : Authenticate a User using : POST "/api/auth/login" . Doesnt Require Auth - No login Required
router.post('/login',
[
    body('email',"Enter Valid Email").isEmail(),
    body('password',"Password can not be blank").exists(),
],
async (req, res)=>{
    //if there are errors return bad request and the errors
    let sucess =false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //destructing
    const {email,password}= req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Please try to login with correct credentials"});
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            sucess=false
            return res.status(400).json({sucess,error:"Please try to login with correct credentials"});
        }
        const data = {
            user:{id:user.id}
        }
        const authtoken  = jwt.sign(data,JWT_SECRET);
        sucess=true
        res.json({sucess,authtoken});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error Occured");
    }
})

// ROUTE 3 : Get login user Detail using : POST "/api/auth/getuser" .login Required
router.post('/getuser',fetchuser,async (req, res)=>{
try {
   
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    console.log(req.user);
    res.send(user);
    
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error Occured");
}
})
module.exports=router 