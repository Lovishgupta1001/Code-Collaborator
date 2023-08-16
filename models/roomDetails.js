const mongoose = require('mongoose');
const{Schema,model} = mongoose;

const DetailSchema =new Schema(
{
    HtmlData:String,
    CssData:String,
    JavaScriptData:String
});

const Data = model('Detail',DetailSchema);
module.exports=Data;