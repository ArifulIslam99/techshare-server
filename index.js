const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json())
const { MongoClient, MongoCursorInUseError } = require('mongodb');
require('dotenv').config()
const port =  process.env.PORT || 5000 ;

const fileUpload = require('express-fileupload')

app.use(fileUpload())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yydji.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

async function run ()
{
       try{
         await client.connect();
         const database = client.db('TechShare')
         const usersCollection = database.collection('users')
         const blogsCollection = database.collection('blogs')


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
          const options = { upsert : true}

          const updateDoc = {$set : user}

          const result = await usersCollection.updateOne(filter, updateDoc, options)

          
        }) 

        app.post('/blogs', async(req, res )=>{
          const title = req.body.title;
          const author = req.body.author;
          const description = req.body.description;
          const status = req.body.status;

          const pic = req.files.image;
          const picData = pic.data;
          const encodedPic = picData.toString('base64')
          const image = Buffer.from(encodedPic, 'base64');

           const blogs = {
             
             title, description, author, status, image
           }

           const result  = await blogsCollection.insertOne(blogs)
           res.json(result)
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

         app.get('/blogs', async(req, res)=>{
             const blogs =  blogsCollection.find({});
             const result = await blogs.toArray();
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