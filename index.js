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
    /* const authorization = req.headers.authorization; */
    if (!authorization) {
        return res.status(401).send({ massage: 'unauthorized access' })
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(403).send({ massage: 'forbidden Access' })
        }
        console.log('prev decoded email', decoded)
        req.decoded = decoded;
        next()
    });
}

async function run() {
    try {
        await client.connect();
        const database = client.db('manufacturedb').collection('parts')
        const ordersCollection = client.db('manufacturedb').collection('orders');
        const usersCollection = client.db('manufacturedb').collection('users');
        const reviewCollecttion = client.db('manufacturedb').collection('review');
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
            console.log('email', email)
            const decodedEmail = req.decoded.email;
            console.log('decoded email', decodedEmail)
            if (email === decodedEmail) {
                const query = { email: email };
                const purchase = await ordersCollection.find(query).toArray();
                return res.send(purchase);
            }
            else {
                return res.status(403).send({ massage: 'forbidden access' })
            }
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
            const token = jwt.sign({ email: email }, process.env.TOKEN_SECRET, { expiresIn: '24h' })
            res.send({ result, token });
        })

        //making this user to admin
        app.put('/user/admin/:email', varifyJWT, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        //getting admin role
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user?.role === 'admin';
            res.send({ admin: isAdmin })
        })


        //getting all the users who are loged in our website
        app.get('/user', async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        });




        //review
        app.post('/review', async (req, res) => {
            const data = req.body;
            const result = await reviewCollecttion.insertOne(data);
            res.send(result);
        });

        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollecttion.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('welcome to biplobs company')
})

app.listen(port, () => {
    console.log(`listening the port `, port)
})