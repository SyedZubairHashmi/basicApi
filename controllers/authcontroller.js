const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req,res) =>{
    const {name, email, password} = req.body;
    try{
        const existinguser = await User.findOne({email});
        if(existinguser) return res.staus(400).json({messege:"user already exist"});

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password:hashedPassword});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn : "1d"})
        res.json({token, user});
    }catch(err){
        console.error(err.messege);
        res.status(500).json({messege:"server errore"});
    }
}

exports.login = async (req,res) =>{
    const {name , email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user) return res.staus(400).json({messege:"invalid eamil or password'"});

        const match =await bcrypt.compare(password, user.password);
        if(!match) return res.status(400).json({messege:"invalid eamil or password'"});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
        res.json({token, user});

}catch(err){
    console.error(err.messege);
    res.status(500).json({messege: "server errore"})
}}