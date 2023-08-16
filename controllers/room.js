const Data = require('../models/roomDetails');

const doCreateRoom = async(req,res)=>
{
    try 
    {
      const newRoom = await Data.create({HtmlData:'',CssData:'',JavaScriptData:''});
      res.status(201).json({ roomId: newRoom._id.toString() });
    } 
    catch (error) 
    {
      console.error('Error creating a new room:', error);
      res.status(500).json({ error: 'Something went wrong.' });
    }
}

const doCheckRoom = async(req,res)=>
{
    try
    {
      const id = req.params.id;
      const object = await Data.findOne({ _id: id });
      if(object === null)
      {
        return res.json({ exists: '0'});
      }
      // console.log(object);
      return res.json({ exists:'1','data': object });
    } 
    catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Something went wrong.' });
    }
}
module.exports = {doCreateRoom, doCheckRoom};