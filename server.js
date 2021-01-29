//importing 
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Rooms from'./dbRooms.js';
import Pusher from 'pusher';
import cors from  'cors';
//app config
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
    appId: "1146473",
    key: "f61656c8592b902adfa7",
    secret: "82994a4823dafff50aee",
    cluster: "eu",
    useTLS: true
  });
//middleware
app.use(express.json());

app.use(cors());

// app.use((req,res,next)=>{
//  res.setHeader("Access-Control-Allow-Origin","*");
//  res.setHeader("Access-Control-Allow-Headers","*");
//  next();
// });

//DB config
const connection_url =`mongodb+srv://robin:robin123456@cluster0.vg9mr.mongodb.net/whatsappdb?retryWrites=true&w=majority`;
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.once('open',()=>{
    console.log("DB is connected!");

    const msgCollection = db.collection("messagecontents");
    const changesSream = msgCollection.watch();

    const roomCollection = db.collection("roomcontents");
    const roomChangeScream= roomCollection.watch();

    changesSream.on("change",(change)=>{
        console.log(change);

        if(change.operationType ==="insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name:messageDetails.name,
                message:messageDetails.message,
                received:messageDetails.received,
                roomId: messageDetails.roomId,
                uId:messageDetails.uId,
                timestamp:messageDetails.timestamp
            });
        }else{
            console.log('Error triggering Pusher.Type:'+change.operationType);
        }
    });

    roomChangeScream.on("change",(change)=>{
        if(change.operationType==="insert"){
            const roomDetails = change.fullDocument;

            pusher.trigger("rooms","inserted",{
                name:roomDetails.name,
                timestamp:new Date().toUTCString()
            });
        }else{
            console.log('Error triggering Pusher.Type:'+change.operationType);
        }
    })
    console.log();

    
});

//????


//api routes
app.get('/',(req,res)=> res.status(200).send('OK'));

app.get('/rooms/sync',(req,res)=>{
  Rooms.find((err,data)=>{
      if(err){
          res.status(500).send(data);

      }else{
          res.status(200).send(data);
      }
  })
});

app.get('/messages/sync',(req,res)=>{
  Messages.find((err,data)=>{
      if(err){
          res.status(500).send(err);
      }else{
          res.status(200).send(data);
      }
  });
});

app.post('/messages/new', (req,res) => {
    const dbMessage= req.body;

    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    });
})

app.post('/rooms/new',(req,res)=>{
    const dbRoom= req.body;

    Rooms.create(dbRoom,(err,data)=>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(data);
        }
    })
})

//listener
app.listen(port, ()=> console.log(`Listening On Localhost : ${port}`))
