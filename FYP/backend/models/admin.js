const mongoose = require("mongoose")
const schema = mongoose.Schema;

const Admin = new schema(
    {
      
        adminName:{
            type: String,
            required:true
        },
         adminPhone:{
            type: Number,
            required:true
        },
        adminEmail:{
            type:String,
            required:true
        },
        
        adminPassword:{
            type: String,
            required: true
        },
        adminImage: {
            type: String
        }
      
    
    }
)

const admin= mongoose.model("admin",Admin);
module.exports=admin;