import app from "./app.js";
import "dotenv/config"
const port = process.env.PORT || 8000
app.get("/",(req,res)=>{
    res.send("Hello World")
})
app.listen(port,()=>{
    console.log("Active at port",port)
})