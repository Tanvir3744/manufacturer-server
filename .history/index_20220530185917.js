const express = require('express');
const cors = require('cors')

const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectID } = require('bson');
var jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middlewares usage
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.6d5m3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//varifiying jwt 
function varifyJWT(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({massage:'unauthorized access'})
    }
    const token = authorization.split(' ')[1]
    console.log(token)
}

async function run() {
    try {
        await client.connect();
        const database = client.db('manufacturedb').collection('parts')
        const ordersCollection = client.db('manufacturedb').collection('orders');
        const usersCollection = client.db('manufacturedb').collection('users');
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
            const product = req.body;
            const query = { productName: product.name, email: product.email }
            const exists = await ordersCollection.findOne(query);
            if (exists) {
                return res.send({ success: false, product: exists })
            }
            const result = await ordersCollection.insertOne(product);
            return res.send({ success: true, result });
        });


        //getting email based my order 
        app.get('/orders', varifyJWT, async (req, res) => {
            const email = req.query.email;
            const authorization = req.headers.authorization;
            console.log(authorization)
            const query = { email: email };
            const purchase = await ordersCollection.find(query).toArray();
            res.send(purchase);
        });

        //updating users information
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const userBody = req.body;
            console.log(userBody)
            const filter = { email: email };
            const option = { upsert: true };
            const updatedDoc = {
                $set: userBody
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, option);
            const token = jwt.sign({email:email}, process.env.TOKEN_SECRET, { expiresIn: '24h' })
            res.send({result, token});
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