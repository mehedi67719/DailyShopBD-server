require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const categoriecollection=db.collection("categories")
    const cartcollection=db.collection("cart")


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


    app.get('/categories',async(req,res)=>{
      try{
        const categorie=await categoriecollection.find();
        const result=await categorie.toArray();
        res.send(result)
      }
      catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"})
      }
    })
    

    app.post("cart",async(req,res)=>{
      try{
        const cart=req.body;
        const addcart=await cartcollection.insertOne(cart);
        res.status(201).json({ message: "Product added"})
      }
      catch(err){
        res.status(500).json({error:err.message })
      }
    })


    app.get("/products",async(req,res)=>{
      try{
      const search=req.query.search || "";
        const page=parseInt(req.query.page)|| 1;
        const limit=parseInt(req.query.limit)|| 8;
        const skip=(page-1)*limit

      let filter={};


      if(search){filter={
        name:{$regex:search, $options: "i"}
      }}

      const totalproducts=await productcollection.countDocuments(filter);
      const totalpages=Math.ceil(totalproducts/limit)
      const products=await productcollection.find(filter).skip(skip).limit(limit).toArray();
      res.send({products,totalpages,totalproducts, currentPage: page});
      }
      catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"})
      }
    })


    app.get("/top-rated-products",async(req,res)=>{
      try{
        const products=await productcollection.find().sort({reviewsCount:-1,rating:-1}).limit(4).toArray();
        res.send(products)
      }
      catch(err){
        console.log(err);
        res.status(500).json({error:"Internal server error"})
      }
    })

    app.get("/product-detels/:id",async(req,res)=>{
      try{
        const id=req.params.id;

        const product=await productcollection.findOne({_id:new ObjectId(id)})
        if(!product){
          return res.status(404).json({error:"product not found"});
        }
        res.send(product);
      }
      catch
       ( err){
          console.log(err)
          res.status(500).json({error:"Internal server error"})
        }
      
    });


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
