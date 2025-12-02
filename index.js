require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.json());
app.use(cors());

async function run() {
  try {
    await client.connect();
    const db = client.db("dailyshop");
    const productcollection = db.collection("products");
    const categoriecollection = db.collection("categories");
    const cartcollection = db.collection("cart");
    const ordercollection = db.collection("order");

    app.get('/categories', async (req, res) => {
      try {
        const categories = await categoriecollection.find().toArray();
        res.send(categories);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    });

    app.post("/cart", async (req, res) => {
      try {
        const cart = req.body;
        const result = await cartcollection.insertOne(cart);
        res.status(201).json({ message: "Product added", insertedId: result.insertedId });
      } catch (error) {
        res.status(500).json({ message: "Failed to add product" });
      }
    });

    app.post("/order", async (req, res) => {
      try {
        const order = req.body;
        await ordercollection.insertOne(order);
        res.status(201).json({ message: "Order successful" });
      } catch (error) {
        res.status(500).json({ message: "Order failed" });
      }
    });


    app.get("/clint-order",async(req,res)=>{
      try{
        const order=await ordercollection.find().toArray();
        res.send(order)
      }
      catch(err){
        res.status(500).json({message:"failed to fetch order data"})
      }
    })





    app.delete("/clint-order/:id",async(req,res)=>{
      const id=req.params.id;
      try{
        const quary={_id: new ObjectId(id)}
        const result=await ordercollection.deleteOne(quary)

        if(result.deletedCount===1){
          res.send({success: true, message: "Product deleted successfully"})

      }
      else{
        res.status(404).send({success: false, message: "Product not found"})
      }
    }
    catch(err){
      res.status(500).send({ success: false, message: "Error deleting product", error });
    }
  })





    app.get("/cart", async (req, res) => {
      try {
        const carts = await cartcollection.find().toArray();
        res.send(carts);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch cart" });
      }
    });



app.delete("/cart/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await cartcollection.deleteOne({ _id:id });
    if (result.deletedCount === 1) {
      res.send({ success: true, message: "Cart item deleted successfully" });
    } else {
      res.status(404).send({ success: false, message: "Cart item not found" });
    }
  } catch (err) {
    res.status(500).send({ success: false, message: "Error deleting product", error: err });
  }
});


    app.get("/products", async (req, res) => {
      try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        let filter = {};
        if (search) filter = { name: { $regex: search, $options: "i" } };

        const totalproducts = await productcollection.countDocuments(filter);
        const totalpages = Math.ceil(totalproducts / limit);
        const products = await productcollection.find(filter).skip(skip).limit(limit).toArray();

        res.send({ products, totalpages, totalproducts, currentPage: page });
      } catch (error) {
        res.status(500).json({ message: "Failed to load products" });
      }
    });

    app.get("/top-rated-products", async (req, res) => {
      try {
        const products = await productcollection.find().sort({ reviewsCount: -1, rating: -1 }).limit(4).toArray();
        res.send(products);
      } catch (error) {
        res.status(500).json({ message: "Failed to load top rated products" });
      }
    });

    app.get("/product-detels/:id", async (req, res) => {
      try {
        const id = req.params.id.trim();
        if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

        const product = await productcollection.findOne({ _id: new ObjectId(id) });
        if (!product) return res.status(404).json({ error: "Product not found" });

        res.send(product);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch product" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
