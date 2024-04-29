const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xnvb7mx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const database = client.db("spotDB");
        const spotCollection = database.collection("spot");
        const userCollection= database.collection("user")

        app.get('/spot',async(req,res)=>{
            const cursor = spotCollection.find();
            const result = await cursor.toArray();
            res.send(result)
          })
 
          
          app.get('/spot/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:new ObjectId(id)}
            const result =await spotCollection.findOne(query)
            res.send(result)
        }) 
        
    
        app.post('/spot', async (req, res) => {
            const newSpot = req.body;
            console.log(newSpot)
            const result = await spotCollection.insertOne(newSpot)
            res.send(result)
        })

        app.get('/bangladeshSpots/:country', async(req,res)=>{
          const country = req.params.country;
          const query = {country:country};
          const result = await spotCollection.find(query).toArray();
          res.send(result)
        })

        app.put('/spot/:id',async(req,res)=>{
            const id = req.params.id;
            const filter={_id: new ObjectId(id)};
            const options = { upsert: true };
            const updatedSpot=req.body;
            const spot = {
              $set: {
                country:updatedSpot.country,
                spot:updatedSpot.spot,
                location:updatedSpot.location,
                averageCost:updatedSpot.averageCost,
                season:updatedSpot.season,
                travelTime:updatedSpot.travelTime,
                visitors:updatedSpot.visitors,
                description:updatedSpot.description,
                photo:updatedSpot.photo,
               
              },
            };
            const result=await spotCollection.updateOne(filter,spot,options)
            res.send(result)
      
          })

        app.delete('/spot/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result =await spotCollection.deleteOne(query)
            res.send(result)
      
          })
          
          // user related

          app.post('/user',async(req,res)=>{
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser)
            res.send(result);
          })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Tour mentor is running')
})

app.listen(port, () => {
    console.log(`tour mentor is running port on ${port}`)
})