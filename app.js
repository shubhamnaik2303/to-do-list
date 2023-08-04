const bodyParser = require("body-parser");
const express = require("express");
const mongoose= require("mongoose");
const _ =require("lodash");

const app = express();

let workItems=[];

app.set('view engine', 'ejs');//this line should be written as it is

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); //to access css

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/todolistDB",{useNewUrlParser:true});
mongoose.set('strictQuery', true);


const itemSchema ={
    name: String
};

const Item=mongoose.model("Item",itemSchema);

const item1 = new Item({
    name: "Welcome"
});

const item2 = new Item({
    name: "Shubham"
});

const item3 = new Item({
    name: "Naik"
});

const defaultItems=[item1,item2,item3]

const listSchema={
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List",listSchema);
app.get("/", function (req, res) {

    
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log("err")
                }else{
                    console.log("Success");
                }
            })
        res.redirect("/");
        }else{
        res.render('list', {listTitle: "Today", newListItems: foundItems});
        }
    })
});

app.post("/",function(req,res){

    const itemName =req.body.newItem;
    const listName =req.body.list;
    const item = new Item({
        name: itemName          //inserting new item in db
    });

    if(listName==="Today"){
    item.save();
    res.redirect("/");
    }else{
        List.findOne({name: listName},function(err,foundlist){
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/"+listName);
        })
    }
});

app.post("/delete",function(req,res){
    
    const checkedItemId=req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today"){

    Item.findByIdAndRemove(checkedItemId,function(err){
        if(!err){
            console.log("Successfully deleted");
            res.redirect("/");
        }else{
            console.log(err);
        }
    });

    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkedItemId}}},function(err,foundlist){
            if(!err){
                res.redirect("/"+ listName);
            }
        });
    }
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err,foundlist){
        if(!err){
            if(!foundlist){
                //create a new list
                const list=new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/"+ customListName);
            }else{
               //show an existing list
                res.render('list', {listTitle: foundlist.name, newListItems: foundlist.items});
            }
        }     
    })
    
});


app.listen(3000, function () {
    console.log("Server started on port 3000");
});