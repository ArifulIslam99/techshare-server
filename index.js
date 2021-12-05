const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json())
const { MongoClient, MongoCursorInUseError } = require('mongodb');
require('dotenv').config()
const port = 5000 ;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yydji.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

async function run ()
{
       try{
         await client.connect();
         const database = client.db('TechShare')
         const usersCollection = database.collection('users')


        app.post('/users', async(req, res)=>{
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.json(result)
          
        })  

        app.get('/users/:email', async(req, res) =>{

          const email = req.params.email;
          const query = {email : email}
          const user = await usersCollection.findOne(query)
          res.json(user)
        })

        app.put('/users', async(req, res)=>{
          const user = req.body;
          const filter = {email : user.email}
           console.log(user)
          const options = { upsert : true}

          const updateDoc = {$set : user}

          const result = await usersCollection.updateOne(filter, updateDoc, options)

          
        }) 

        app.put('/users/roles' , async(req, res)=>{

          const user = req.body;
          const filter = {email: user.email}
          const updateDoc = {$set : {role: user.roles}}
          const result = await usersCollection.updateOne(filter, updateDoc)
          res.json(result)
        })

         app.get('/users', async(req, res)=>{
             const users =  usersCollection.find({});
             const result = await users.toArray();
             res.json(result)
         })
         
      }
      finally{
        // await client.close()
      }
}


run().catch(console.dir)

app.get('/', (req, res)=>{
    res.send("TechShare Server is ON");
})

app.listen(port, ()=>{
    console.log("Listening From Localhost: ", port)
})