require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    const ordercollection=db.collection("order")

    app.get('/categories', async (req, res) => {
      const categories = await categoriecollection.find().toArray();
      res.send(categories);
    });

    app.post("/cart", async (req, res) => {
      const cart = req.body;
      await cartcollection.insertOne(cart);
      res.status(201).json({ message: "Product added" });
    });

    app.post("/order",async(req,res)=>{
      const order=req.body;
      await ordercollection.insertOne(order);
      res.status(201).json({message:"order successfull"})
    })

    app.get("/cart", async (req, res) => {
      const carts = await cartcollection.find().toArray();
      res.send(carts);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id.trim();
      if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid ID" });

      const result = await cartcollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) return res.status(404).json({ message: "Product not found in cart" });

      res.json({ message: "Product deleted successfully", deletedId: id });
    });

    app.get("/products", async (req, res) => {
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
    });

    app.get("/top-rated-products", async (req, res) => {
      const products = await productcollection.find().sort({ reviewsCount: -1, rating: -1 }).limit(4).toArray();
      res.send(products);
    });

    app.get("/product-detels/:id", async (req, res) => {
      const id = req.params.id.trim();
      const product = await productcollection.findOne({ _id: new ObjectId(id) });
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.send(product);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
