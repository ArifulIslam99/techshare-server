const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json())
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, MongoCursorInUseError } = require('mongodb');
require('dotenv').config()
const port =  process.env.PORT || 5000 ;

const fileUpload = require('express-fileupload');
const { query } = require('express');

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
         const feedBackCollection = database.collection('feedbacks')
         const productCollection = database.collection('products')

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
          const authorEmail = req.body.email;
          const pic = req.files.image;
          const picData = pic.data;
          const encodedPic = picData.toString('base64')
          const image = Buffer.from(encodedPic, 'base64');
          
           const blogs = {
             
              title,authorEmail, description, author, status, image,
           }

           const result  = await blogsCollection.insertOne(blogs)
           res.json(result)
        }) 

        app.get('/feedbacks', async(req, res) => {
          
            const feedbacks =  feedBackCollection.find({});
            const result = await feedbacks.toArray()
            res.json(result)

        }) 

        app.get('/products', async(req, res)=>{
         
          const products = productCollection.find({})
          const result = await products.toArray()
          res.json(result)

        }) 

        app.post('/products', async(req, res) =>{
          const catagory = req.body.catagory;
          const brand = req.body.brand;
          const model = req.body.model;
          const price = req.body.price;
          const specification = req.body.spec;
          const priority = req.body.priority;
          const pic = req.files.image;
          const picData = pic.data;
          const encodedPic = picData.toString('base64')
          const image = Buffer.from(encodedPic, 'base64');

          const product = {
            catagory, brand, model, price, specification, priority,image
          } 

          console.log(product) 

          const result = await productCollection.insertOne(product)

          res.json(result)
        })

        app.post('/feedbacks', async(req, res) => {
            
             const feedbacks = req.body;
             const result = await feedBackCollection.insertOne(feedbacks)
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


         app.get('/blog/:id', async(req, res) => {
           const id = req.params;
           const filter = { _id : ObjectId(id)};
           const query = await blogsCollection.findOne(filter)
           res.json(query)
         })

         app.delete('/blog/:id', async(req, res)=>{
           const id = req.params;
           const filter = { _id : ObjectId(id)};
           const query = await blogsCollection.deleteOne(filter)
           res.json(query)
         })
         

        app.get('/blogs/:email', async(req, res) =>{

           const author = req.params;
           
           const filter = { authorEmail : author.email}
           console.log(filter)
           const query = blogsCollection.find(filter)
           const result = await query.toArray()
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