const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken")
const stripe = require('stripe')('sk_test_51N3foiGn4oE3WVXCgQSXeJzqwLQa97LhGyJxN3d3I6kJ0V6PAFOMCU0kSNsBb22SidKzZ4XgFNlZjzMlgqrWjNPQ000j0lYAAt');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.port || 5000
const app = express();



// middleware
app.use(cors());
app.use(express.json());



const uri = process.env.DB_URI
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})
console.log(process.env.STRIPE_SECRET_KEY)
console.log(uri)

const DBConnect = async () => {
    try {
        await client.connect();
        console.log("success connection");
    } catch (error) {
        console.log(error.message);
    }
}

DBConnect();


const costumesCollection = client.db('EventHiveDb').collection('costumes');
const MakeupServiceCollection = client.db('EventHiveDb').collection('mackup');
const usersCollection = client.db('EventHiveDb').collection('users');
const bookingsCollection = client.db('EventHiveDb').collection('bookings');
const venueCollection = client.db('EventHiveDb').collection('venue');
const PhotographerCollection = client.db('EventHiveDb').collection('Photographer');
const paymentsCollection = client.db('EventHiveDb').collection('payments');




// test server
app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "Task manager app server is running.."
    })
})



app.listen(port, () => {
    console.log("server is running in ", port || 5000);
})


/*  --------------------put operation ----------------- */
// Save user email & generate JWT
app.put('/user/:email', async (req, res) => {
    try {
        const email = req.params.email
        const user = req.body

        const filter = { email: email }
        const options = { upsert: true }
        const updateDoc = {
            $set: user,
        }
        const result = await usersCollection.updateOne(filter, updateDoc, options)

        // const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        //     expiresIn: '1d',
        // })
        // console.log(result, token)
        res.send(result)
    } catch (error) {
        console.log(error.message)
    }
})







/*---------------  GET OPEration ____________*/


// generate jwt token
app.get("/jwt", (req, res) => {
    try {
        const { email } = req.query;
        console.log(email);

        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '100d',
        })
        if (token) {
            console.log(token)
            res.send({ token })
        }
        else {
            res.send({ message: "Failed to get token from server" })
        }

    } catch (error) {
        console.log(error)

    }

})
// get a single user by email

app.get("/user/:email", async (req, res) => {

    try {
        const { email } = req.params;
        console.log(email)
        const query = {
            email: email
        }
        const result = await usersCollection.findOne(query);
        res.send(result)
    } catch (error) {
        console.log(error.message)
    }
})



// get specific costumes
app.get("/costumes", async (req, res) => {
    try {
        // const query = {};
        // const cursor = costumesCollection.find(query);
        const result = await costumesCollection.find({}).toArray();
        res.send({
            success: true,
            message: "successfully got the data",
            data: result
        });
        // console.log(result);
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})
//venue 
app.get("/venue", async (req, res) => {
    try {

        const result = await venueCollection.find({}).toArray();
        res.send({
            success: true,
            message: "successfully got the data",
            data: result
        });

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})
// single venue
app.get("/venue/:id", async (req, res) => {
    try {
        const id = req.params.id
        const result = await venueCollection.findOne({ _id: new ObjectId(id) });
        res.send({
            success: true,
            message: "successfully got the data",
            data: result
        });
        // console.log(result);
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})
app.get("/makeup-artists", async (req, res) => {
    try {
        // const query = {};
        // const cursor = costumesCollection.find(query);
        const result = await MakeupServiceCollection.find({}).toArray();
        res.send({
            success: true,
            message: "successfully got the data",
            data: result
        });
        // console.log(result);
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})
app.get("/costumes/:id", async (req, res) => {
    try {
        const id = req.params.id
        const result = await costumesCollection.findOne({ _id: new ObjectId(id) });
        res.send({
            success: true,
            message: "successfully got the data",
            data: result
        });
        // console.log(result);
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})
app.get("/makeup-artists/:id", async (req, res) => {
    try {
        const id = req.params.id
        const result = await MakeupServiceCollection.findOne({ _id: new ObjectId(id) });
        res.send({
            success: true,
            message: "successfully got the data",
            data: result
        });
        // console.log(result);
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})


// get all users 

app.get("/users", async (req, res) => {
    try {
        const result = await usersCollection.find({}).toArray()
        res.send(result)
    } catch (error) {
        console.log(error.message)
    }
})

app.get("/orders", async (req, res) => {
    try {
        const result = await bookingsCollection.find({}).toArray()
        res.send(result)
    } catch (error) {
        console.log(error.message)
    }
})

app.get('/order', async (req, res) => {

    try {
        let query = {};

        if (req.query.email) {
            query = {
                email: req.query.email
            }

        }
        const orders = await bookingsCollection.find(query).toArray();
        res.send(orders);
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
//PhotographerCollection

app.get("/photography", async (req, res) => {
    try {
        const result = await PhotographerCollection.find({}).toArray()
        res.send({
            success: true,
            message: "successfully got the data",
            data: result
        });
    } catch (error) {
        console.log(error.message)
    }
})
app.get("/photography/:id", async (req, res) => {
    try {
        id = req.params.id
        const result = await PhotographerCollection.findOne({ _id: new ObjectId(id) })
        res.send({
            success: true,
            message: "successfully got the data",
            data: result
        });
    } catch (error) {
        console.log(error.message)
    }
})




/*---------------  GET OPEration ____________*/







/*---------------  Patch OPEration ____________*/
// set role and change them
app.patch('/user/:email', async (req, res) => {
    try {
        const newData = req.body;
        const email = req.params.email;
        // console.log(email, newData.role)
        const filter = { email: email };
        const updateDoc = {
            $set: { role: newData?.role }
        };

        // Update the user in the collection
        const result = await usersCollection.updateOne(filter, updateDoc);

        if (result.acknowledged) {
            res.send({
                message: "Request has send admin to become a merchant ",
                data: result
            });
        } else {
            res.status(404).send({
                message: "Request to become a merchant is failed",
                data: null
            });
        }
    } catch (error) {
        console.log(error.message)
    }
});

// make admin 
app.put('/user/admin/:id', async (req, res) => {

    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            role: 'admin'
        }
    }
    const result = await usersCollection.updateOne(filter, updateDoc, options)
    res.send(result)
})

// check admin
app.get('/users/admin/:email', async (req, res) => {

    const email = req.params.email;
    const query = { email }
    const user = await usersCollection.findOne(query);
    res.send({ isAdmin: user?.role === 'admin' })
})

/*---------------  Patch OPEration ____________*/





/*---------------  POST OPEration ____________*/

// Save bookings
app.post('/orders', async (req, res) => {
    try {
        const orders = req.body;
        console.log(orders)
        const data = await bookingsCollection.insertOne(orders)
        res.send(data)
    } catch (error) {
        console.log(error.message)
    }

})
app.post('/upload/:event', async (req, res) => {
    try {
        const event = req.params.event;
        const eventData = req.body;
        let collection;
        switch (event) {
            case 'Photographer':
                collection = PhotographerCollection;
                break;
            case 'Venue & food':
                collection = venueCollection;
                break;
            case 'Makeup & decoration':
                collection = MakeupServiceCollection;
                break;
            case 'Costumes':
                collection = costumesCollection;
                break;
            default:
                return res.status(400).json({ error: 'Invalid event type' });
        }

        const data = await collection.insertOne(eventData);
        res.send(data);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }

})




/*---------------  Post OPEration ____________*/

//payments
app.post('/create-payment-intent', async (req, res) => {
    try {
        const booking = req.body;
        const price = booking.price;
        const amount = price * 100;
          console.log(amount)
        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'usd',
            amount: amount,
            "payment_method_types": [
                "card"
            ]
           
        })
        res.send({
            clientSecret: paymentIntent.client_secret,
        })
       
    }
    catch (error) {
        console.log(error.message)
    }
})


// save payment data
app.post('/payments', async (req, res) => {
    try {
        const payment = req.body;
        console.log("hit payment")
        const result = await paymentsCollection.insertOne(payment);
        const id = payment.bookingId
        const filter = { _id: new ObjectId(id) }
        const updatedDoc = {
            $set: {
                paid: true,
                transactionId: payment.transactionId
            }
        }
        const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
        res.send(result)
    } catch (error) {
        console.log(error.message)
    }
})


//payments order
app.get('/orders/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const order = await bookingsCollection.findOne(query);
    res.send(order)
})
