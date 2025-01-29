import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { fileURLToPath } from 'url';
import path from "path";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

//const __dirname = path.dirname(fileURLToPath(import.meta.url));


const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));


let op = "";
let items = [
  { id: 1, title: "DSA" },
  { id: 2, title: "WebDev" },
];

// Route to render index.ejs
app.get("/", async (req, res) => {
  res.render("index.ejs");
});

// Route to handle POST request to choose a category
app.post("/choose", async (req, res) => {
  op = req.body.choosen;
  res.redirect(`/list/${op}`);
});

// Route to display items from selected category
app.get("/list/:op", async (req, res) => {
  const op = req.params.op; // Get op from URL parameter
  try {
    const result = await db.query(`SELECT * FROM ${op} ORDER BY id ASC`);
    items = result.rows;
    res.render("after.ejs", {
      listTitle: op,
      listItems: items,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching data");
  }
});

// Route to add new item to selected category
app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query(`INSERT INTO ${op} (title) VALUES ($1)`, [item]);
    res.redirect(`/list/${op}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding item");
  }
});

// Route to update item in selected category
app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;
  try {
    await db.query(`UPDATE ${op} SET title = ($1) WHERE id = $2`, [item, id]);
    res.redirect(`/list/${op}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating item");
  }
});

// Route to delete item from selected category
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query(`DELETE FROM ${op} WHERE id = $1`, [id]);
    res.redirect(`/list/${op}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting item");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
