
const express = require("express");
const cors = require("cors");
const adminRouter = require("./Routes/AdminRoute.js");
const EmployeeRouter = require("./Routes/EmployeeRoute.js");
const Jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const nodeVersion = process.version;
console.log(`Your Node.js version is: ${nodeVersion}`);

const app = express() 
app.use(cors({origin:["http://localhost:5173"], credentials: true,}))
app.use(express.json())
app.use(cookieParser())
app.use('/auth', adminRouter)
app.use('/employee', EmployeeRouter)
app.use(express.static('Public'))
app.get("/", (req, res)=>{
    return res.send("iam server running fine")
})

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(token) {
        Jwt.verify(token, "jwt_secret_key", (err ,decoded) => {
            if(err) return res.json({Status: false, Error: "Wrong Token"})
            req.id = decoded.id;
            req.role = decoded.role;
            next()
        })
    } else {
        return res.json({Status: false, Error: "Not autheticated"})
    }
}
app.get('/verify',verifyUser, (req, res)=> {
    return res.json({Status: true, role: req.role, id: req.id})
} )

app.listen(3000, () => {
    console.log("Server is running")
})