//jshint esversion:6
require('dotenv').config();
const express = require("express");
const _ = require("lodash");
const { MongoClient, ServerApiVersion } = require('mongodb');
const client = new MongoClient(process.env.URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
const myDB = client.db('test');


app.get("/", function(req, res){
  res.redirect("/" + "Today");
});


app.get("/:customListName", async function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    if (customListName == "About"){
      about(res);
    } else {
      const myCol = myDB.collection('lists');
      await client.connect();
      const result = await myCol.findOne({name: customListName});
      if (result){
        let result2 = [];
        result.items.forEach(myf);
        function myf(value){
          result2.push({name:value});
        }
        res.render("list", {listTitle: result.name, newListItems: result2});
      } else {
        addNewList(customListName, myCol, res);
      }
    }
});

async function addNewList(listName, myCol, res){
    await myCol.insertOne({name: listName, 
    items:["navid", "omid", "ali"]});
    res.redirect("/" + listName);
} 


app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const myCol = myDB.collection('lists');
  await client.connect();
  const result = await myCol.findOne({name: listName});
  result.items.push(itemName);
  await myCol.updateOne({name: listName}, {$set:{items: result.items}});
  res.redirect("/" + listName);
});


app.post("/delete", async function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  const myCol = myDB.collection('lists');
  await client.connect();
  await myCol.findOneAndUpdate({name: listName}, {$pull: {items:checkedItem}});
  res.redirect("/" + listName);
});


function about(res){
  res.render("about");
};


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
