const express = require('express')
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.islim.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("anandamela");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");
        const userCollection = database.collection("users");
        // console.log(productCollection);

        // POST A PRODUCT DATA , DETAILS
        app.post('/products', async (req, res) => {
            const productDetails = req.body;
            console.log(productDetails);
            const result = await productCollection.insertOne(productDetails);
            res.send(result)
        })
        // DELETE SINGLE Product DATA
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.json(result)
        })
        // GET ALL PRODUCTS
        app.get("/products", async (req, res) => {
            const cursor = productCollection.find({})
            console.log(cursor);
            const result = await cursor.toArray()
            res.json(result);
        })
        // GET SINGLE PRODUCT DATA
        app.get("/products/:id", async(req,res) => {
            const pdId = req.params.id;
            const query = {_id: ObjectId(pdId)};
            const result = await productCollection.findOne(query);
            res.json(result)
        })
        // PUT ORDER DETAILS
        app.post("/order", async (req, res) => {
            const doc = req.body;
            const result = await orderCollection.insertOne(doc);
            res.json(result)
        })
        // GET MYORDERS
        app.get("/order/:email", async (req, res) => {
            const emailid = req.params.email;
            const query = { email: emailid };
            const myOrders = orderCollection.find(query);
            const result = await myOrders.toArray();
            console.log(result)
            res.json(result)
        })
        // GET ALL ORDERS 
        app.get("/orders", async (req, res) => {
            const cursor = orderCollection.find({})
            const result = await cursor.toArray();
            res.json(result);
        })
        // UPDATE A SINGLE PRODUCT DETAILS
        app.patch("/products/:id", async(req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    name: updateProduct.name,
                    img: updateProduct.img,
                    price: updateProduct.price,
                    category: updateProduct.category,
                    about: updateProduct.about
                }
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        // UPDATE SINGLE ORDER DETAILS API
        app.patch('/order/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateOrder.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        // DELETE SINGLE ORDER DATA
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            res.json(result)
        })
        // USER COLLECTION ADDED ADMIN ROLE / UPDATE ROLE FOR ADMIN
        app.put('/user/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result)
        })
        // POST METHOD USER DETAILS
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result)
        })
        // USERS DATA UPDATE API
        app.put('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })
        // ADMIN ROLE FINDER
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await userCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.get("/", async (req, res) => {
    res.send("Hello from ananadamela server")
})

app.listen(port, () => {
    console.log('Listening the port', port);
})