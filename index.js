const express = require("express")
const cors = require("cors")
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gns3pe2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message:'UnAuthorized Access'})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
        if(err){
            res.status(403).send({message:'Forbidden Access'})
        }
        req.decoded = decoded
        next()
      });
}

async function run() {
    try {
        await client.connect()
        const userCollection = client.db('documentation').collection('users')
        const tutorialCollection = client.db('documentation').collection('tutorials')


        app.put('/user/:email',async(req,res)=>{
            const email = req.params.email;
            const user = req.body
            const filter = {email:email}
            const option = {upsert:true}
            const updateDoc ={
                $set:user
            }
            const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'})
            const result = await userCollection.updateOne(filter,updateDoc,option)
            res.send({result,token})
        });
      app.get('/tutorial',async(req,res)=>{
        const query={}
        const cursor = tutorialCollection.find(query)
        const tutorial = await cursor.toArray()
        res.send(tutorial)
      })
    }
    finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Running Documentation Server')
});
app.listen(port, () => {
    console.log("Listening port", port);
})