require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;


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
    const db =client.db("dailyshop");
    const productcollection=db.collection("products")


    // app.get('/products', async(req,res)=>{
    //     try{
    //         const products=productcollection.find();
    //         const result=await products.toArray();
    //         res.send(result)
    //     }
        
    //     catch (err){
    //         console.log(err);
    //         res.status(500).json({error: "Internal server error"})
    //     }
    // })


    app.get("/products",async(req,res)=>{
      try{
      const search=req.query.search || "";

      let filter={};


      if(search){filter={
        name:{$regex:search, $options: "i"}
      }}

      const result=await productcollection.find(filter).toArray();
      res.send(result);
      }
      catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"})
      }
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
