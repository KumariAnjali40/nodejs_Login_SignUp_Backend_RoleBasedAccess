const express=require('express');
const {connection}=require('./db');
const {userRouter}=require('./routes/users.routes');
const {UserModel}=require('./models/users.model');
const {auth}=require('./middleware/auth.middleware');
const {access}=require('./middleware/access.middleware');
const jwt=require('jsonwebtoken');
const app=express();
app.use(express.json());

app.use("/users",userRouter);

app.get('/',(req,res)=>{
    res.send("Welcome to home page");
})


//auth always come before access
app.get('/list',auth,access(["SuperAdmin","Admin","User"]),(req,res)=>{
    res.json({msg:"All movies data"});
})


//refresh token
app.get("/refresh",(req,res)=>{
  const refresh_token=req.headers.authorization?.split(" ")[1];
  const decoded=jwt.verify(refresh_token,"Anjali");
  console.log(decoded);
  const {userID}=decoded;
  if(decoded){
      const token=jwt.sign({userID:userID},"Anjali",{expiresIn:15000});
      console.log(token);
      res.send(token);
  }else{
      res.send("Invalid refresh token");
  }
})

//get
app.get( "/all",auth,access(["SuperAdmin", "Admin", "User"]),
    async (req, res) => {
      try {
        const user = await UserModel.find(req.query);
        res.status(200).json({ users_list: user });
      } catch (err) {
        res.json({ error: err });
        console.log(err);
      }
    }
  );

//patch
app.patch("/list/update/:id",auth,
    access(["SuperAdmin", "Admin"]),
    async (req, res) => {
      const { id } = req.params;
      const payload = req.body;
      try {
        await UserModel.findByIdAndUpdate({ _id: id }, payload);
        res.status(200).json({ msg: "the user has been updated" });
      } catch (err) {
        res.json({ msg: "err" });
        console.log(err);
      }
    }
  );

//delete
app.delete("/list/delete/:id",
    auth,
    access(["SuperAdmin", "Admin"]),
    async (req, res) => {
      const { id } = req.params;
      try {
        await UserModel.findByIdAndDelete({ _id: id });
  
        res.status(200).json({ msg: "user deleted" });
      } catch (err) {
        console.log(err);
        res.status(400).json({ error: err });
      }
    }
  );

app.listen(4500,async()=>{
    try{
       await connection,
       console.log("connected to db");
       console.log("Server is running at port 4500");
    
    }
    catch(err){
        console.log(err);
    }
    
})