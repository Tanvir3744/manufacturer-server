const express = require('express');
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;

//middlewares usage
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('welcome to manufacture company')
})

app.listen(port, () => {
    console.log(`listening the port `, port)
})