const { MongoClient, ServerApiVersion } = require("mongodb");
const path = require("path");
const express = require("express");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

function connect(cbFn) {
    const uri = "mongodb+srv://donitwod:wAq1nm0yX0zKcYiK@cluster0.grep5ui.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });

    client.connect().then((res) => {
        let collection = client.db("Fodraszat").collection("barbers");
        cbFn(client, collection);
    });
}

app.get("/favico.ico", (req, res) => {
    res.sendStatus(404);
});

app.get("/barbers", (req, res) => {
    connect((cli, coll) => {
        coll.find({})
            .toArray()
            .then((response) => {
                cli.close();
                res.json(response);
            });
    });
});

app.use(express.json());

app.post("/make-appointment/:brbName", (req, res) => {
    const appointment = req.body;

    connect((cli, coll) => {
        coll.updateOne({ name: req.params.brbName }, { $set: appointment }).then((response) => {
            cli.close();
            res.json({ saved: true, message: "időpontfoglalás sikeres" });
        });
    });
});

app.post("/delete-appointment/:brbName/:date/:hour", (req, res) => {
    connect((cli, coll) => {
        coll.updateOne({ name: req.params.brbName }, { $pull: { appointments: { $and: [{ aDate: req.params.date }, { aHour: req.params.hour }] } } }).then((response) => {
            cli.close();
            res.json({ saved: true, message: "Időpont törölve!" });
        });
    });
});

app.listen(3000);
