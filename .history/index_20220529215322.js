const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectID } = require('bson');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middlewares usage
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.6d5m3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db('manufacturedb').collection('parts')
        const ordersCollection = client.db('manufacturedb').collection('orders');
        //getting products from database
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = database.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) }
            const result = await database.findOne(query);
            res.send(result);
        })

        //place order to database
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        });


        //getting email based my order 
        app.get('/orders', async (req, res) => {
            const orders = req.body.email;
            console.log(orders)
            /* const query = { orders: myOrders }
            const result = await ordersCollection.find(query).toArray;
            res.send(result) */
        })

    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('welcome to manufacture company')
})

app.listen(port, () => {
    console.log(`listening the port `, port)
})