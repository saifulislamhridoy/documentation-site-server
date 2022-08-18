const express = require("express")
const cors = require("cors")
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const blogCollection = client.db('documentation').collection('blogs')
        const reviewCollection = client.db('documentation').collection('reviews')
        const courseCollection = client.db('documentation').collection('courses')
        const questionCollection = client.db('documentation').collection('questions')
        const answerCollection = client.db('documentation').collection('answers')

        // collect user and Issue jwt
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
        app.put('/user/:email',async(req,res)=>{
            const email = req.params.email;
            const user = req.body
            const filter = {email:email}
            const updateDoc ={
                $set:user
            }
            const result = await userCollection.updateOne(filter,updateDoc)
            res.send(result)
        });
        // Get Tutorial
      app.get('/tutorial',async(req,res)=>{
        const query={}
        const cursor = tutorialCollection.find(query)
        const tutorial = await cursor.toArray()
        res.send(tutorial)
      });
    //   Get single Tutorial
    app.get('/tutorial/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)}
        const tutorial = await tutorialCollection.findOne(query);
        res.send(tutorial);
    });
    //  Post Tutorial
      app.post('/tutorial',async(req,res)=>{
        const newTutorial = req.body;
        const result = await tutorialCollection.insertOne(newTutorial);
        res.send(result)
      });
    //   Delete Tutorial
    app.delete('/tutorial/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id:ObjectId(id)}
        const result = await tutorialCollection.deleteOne(query);
        res.send(result)
    });
    //   Post Blog
      app.post('/blog',async(req,res)=>{
        const newBlog = req.body;
        const result = await blogCollection.insertOne(newBlog);
        res.send(result)
      });
    //   Get Blog
      app.get('/blog',async(req,res)=>{
        const query ={}
        const cursor = blogCollection.find(query);
        const result = await cursor.toArray()
        res.send(result)
      });
    //   Get single Blog
    app.get('/blog/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)}
        const blog = await blogCollection.findOne(query);
        res.send(blog)
    });
    // Delete Blog
    app.delete('/blog/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id:ObjectId(id)}
        const result = await blogCollection.deleteOne(query);
        res.send(result)
    });
    // Get user
    app.get('/user',async(req,res)=>{
        const query ={}
        const cursor = userCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
      });
    //   Delete User
    app.delete('/user/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id:ObjectId(id)}
        const result = await userCollection.deleteOne(query);
        res.send(result)
    });
    // Get Single User Info
    app.get('/user/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {email:email}
        const user = await userCollection.findOne(query);
        res.send(user)
    });
    // Post Review
    app.post('/review',async(req,res)=>{
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result)
    });
    // Get Review
    app.get('/review',async(req,res)=>{
      const query ={}
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    });
    // Make Admin
    app.put('/user/admin/:email',verifyJWT,async(req,res)=>{
        const email = req.params.email
        const requester=req.decoded.email
        const requesterAccount = await userCollection.findOne({email:requester})
        if(requesterAccount.role==='admin'){
            const filter = {email:email}
            const updateDoc ={
                $set:{
                    role:"admin"
                }
            }
          const result = await userCollection.updateOne(filter,updateDoc)
          res.send(result)
        }
        else{
            res.status(403).send({massege:'Forbidden'})
        }
    });
    // IsAdmin
    app.get('/admin/:email',async(req,res)=>{
        const email = req.params.email
        const user = await userCollection.findOne({email:email})
        const isAdmin = user.role==="admin"
        res.send({admin:isAdmin})
    });
     // get all product 
     app.get('/course', async (req, res) => {
      const query = {};
      const cursor = courseCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
  });
  //  get single data
  app.get('/course/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await courseCollection.findOne(query);
      res.send(result)
  });
  // Collect Question
  app.post('/question',async(req,res)=>{
    const question = req.body;
    const result = await questionCollection.insertOne(question);
    res.send(result);
  });

  // GET Questions
  app.get('/question',async(req,res)=>{
    const query={}
    const cursor = questionCollection.find(query);
    const result = await (await cursor.toArray()).reverse()
    res.send(result)
  });
  // Get Single Question
  app.get('/question/:id',async(req,res)=>{
    const id = req.params.id;
    const query={_id:ObjectId(id)}
    const result = await questionCollection.findOne(query)
    res.send(result)
  })
  // Collect Answer
  app.post('/answer',async(req,res)=>{
    const answer = req.body;
    const result = await answerCollection.insertOne(answer)
    res.send(result)
  });
// Get Answer
app.get('/answer/:id',async(req,res)=>{
  const postId = req.params.id;
  const query = {postId:postId};
  const result = await answerCollection.find(query).toArray();
  res.send(result);
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