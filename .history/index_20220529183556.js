const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middlewares usage
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6d5m3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db('manufacturedb').collection('parts')

        //getting products from database
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = database.find(query)
            const result =await cursor.toArray()
            res.send(result)
        })

        app.get("/products/:id", async (req, res) => {
            
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