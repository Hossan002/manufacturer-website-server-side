const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jgostwr.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri, "successfully connect");
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

  try {
    await client.connect();

    const serviceCollection = client.db('electricalTools').collection('service')
    const orderCollection = client.db('electricalTools').collection('order')
    const ratingCollection = client.db('electricalTools').collection('rating')
    const reviewCollection = client.db('electricalTools').collection('reviews')
    const adminCollection = client.db('electricalTools').collection('users')

    // Create service (POST)
    app.post("/service", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.json(result);

    });
    //API to make Admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          email: email,
          role: "admin"
        },
      };
      const result = await adminCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //API to remove admin
    app.delete("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await adminCollection.deleteOne(filter);
      res.send(result);
    }
    );

    //API to get admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await adminCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
    });

    //API to get all admin
    app.get("/admin", async (req, res) => {
      const admins = await adminCollection.find({}).toArray();
      res.send(admins);
    });

    // insert order
    app.post("/myOrders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    // POST Review
    app.post("/rating", async (req, res) => {
      const rating = req.body;
      const result = await ratingCollection.insertOne(rating);
      res.json(result);
    });

    // getting service
    app.get("/service", async (req, res) => {
      const query = {}
      const cursor = serviceCollection.find(query)
      const services = await cursor.toArray()
      res.send(services)
    });


    // Get Single package
    app.get("/service/:id", async (req, res) => {
      const id = req.params;
      console.log("getting specific service", id);
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    //API to get all reviews
    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.send(reviews);
    });

    //API to post a review
    app.post("/review", async (req, res) => {
      // const decodedEmail = req.decoded.email;
      // const email = req.headers.email;
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
      // if (email === decodedEmail) {

      // } else {
      //   res.send("Unauthorized access");
      // }
    });
    // get orders by email

    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const order = await orderCollection.find(filter).toArray();
      console.log(order);
      res.json(order);
    });

    //Get Rating
    app.get("/rating", async (req, res) => {
      const cursor = ratingCollection.find({});
      const rating = await cursor.toArray();
      res.json(rating);
    });


    // DELETE a service
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.json(result);
    });

    // cancel an order
    app.delete("/myOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

  }
  finally {


  }

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hey, running last assignment!')
});

app.listen(port, () => {
  console.log('Listening on port', port);
})












