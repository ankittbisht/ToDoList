const express = require("express");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash")
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static("public"))
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb+srv://admin-ankit:Ab67743%40gmail@cluster0.dnst8sh.mongodb.net/todolistDB", { useNewUrlParser: true });
}
const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

//create some items

const item1 = new Item({
    name: "Welcome to your todolist"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema ={
    name:String , 
    items:[itemsSchema]
};
const List = mongoose.model("List" ,listSchema);
var today = new Date();
    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    var day = today.toLocaleDateString("en-us", options);

app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("sucessfully saved default items into DB.");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { listTitle: day, additem: foundItems });
        }
    });
});

app.post("/", function (req, res) {
    Newitem = req.body.addtext
    const listname = req.body.submit;
    const item = new Item({
        name: Newitem
    });
    if(listname === day){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name: listname} ,function(err ,foundList){
            foundList.items.push(item);
            foundList.save();
           res.redirect("/" +listname) 
        })
    }
    
})
app.post("/delete" ,function(req,res){
    const checkedItemId = req.body.checkbox;
    const listname  = req.body.listname;
    if(listname === day){
        Item.findByIdAndRemove(checkedItemId , function(err){
            if(!err){
                console.log("successfully deleted checked item.")
            res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name: listname} ,{$pull: {items:{_id : checkedItemId}}},function(err ,foundList){
            if(!err){
                res.redirect("/" +listname);
            }
        });
    }
    
});

app.get("/:customlistname"  ,function(req,res){
    const customlistname = _.capitalize(req.params.customlistname);
    List.findOne({name: customlistname},function(err,foundList){
        if(!err){
            if(!foundList){
                const list  = new List({
                    name : customlistname ,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customlistname)
            }else{
                res.render("list", { listTitle: foundList.name, additem: foundList.items });
            }
        }
    });

   
})

app.listen(3000, function () {
    console.log("your server is running")
});

