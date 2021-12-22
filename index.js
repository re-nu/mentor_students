import express, { request } from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { ObjectID, ObjectId} from "bson";

dotenv.config();

const app=express();

const PORT=process.env.PORT;

app.use(express.json());

const MONGO_URL=process.env.MONGO_URL;

async function CreateConnection() {
    const client=new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Mongodb Connected")
    return client 
}

const client=await CreateConnection();

// const mentor=[
//     {
//         name:"Jhon",
//         students:[
//             {name:"shiva",mentor_assigned:"yes"},
//             {name:"pranoti",mentor_assigned:"yes"}
//         ]
//     },

//     {
//         name:"Raghav",
//         students:[
//             {name:"renuka",mentor_assigned:"yes"},
//             {name:"govardhan",mentor_assigned:"yes"},
//             {name:"deepa",mentor_assigned:"yes"}
//         ]
//     },

//     {
//         name:"Divya",
//         students:[
//             {name:"pratik",mentor_assigned:"yes"},
//             {name:"shyam",mentor_assigned:"yes"},
//             {name:"monika",mentor_assigned:"yes"}
//         ]
//     },

//     {
//         name:"Joycee",
//         students:[
//             {name:"saloni",mentor_assigned:"yes"},
//             {name:"jovel",mentor_assigned:"yes"},
//         ]
//     },
// ]

// const students=[
//             {name:"saloni",mentor_assigned:"yes"},
//             {name:"jovel",mentor_assigned:"yes"},
//             {name:"pratik",mentor_assigned:"yes"},
//             {name:"shyam",mentor_assigned:"yes"},
//             {name:"monika",mentor_assigned:"yes"},
//             {name:"renuka",mentor_assigned:"yes"},
//             {name:"govardhan",mentor_assigned:"yes"},
//             {name:"deepa",mentor_assigned:"yes"},
//             {name:"poonam",mentor_assigned:"no"},
//             {name:"prithvi",mentor_assigned:"no"},
//             {name:"anagha",mentor_assigned:"no"},
//             {name:"rajesh",mentor_assigned:"no"},
//             {name:"arti",mentor_assigned:"no"}
// ]

app.get('/',(request,response)=>{
    response.send("Welcome to Home ...😊")
})

app.post("/mentors",async(request,response)=>{
    const data=request.body;
    const result= await client.db("b28wd").collection("mentors").insertMany(data);
    response.send(result);
})

app.post("/students",async(request,response)=>{
    const data=request.body;
    const result= await client.db("b28wd").collection("students").insertMany(data);
    response.send(result);
})

app.get("/mentors",async(request,response)=>{
    const result=await client.db("b28wd").collection("mentors").find().toArray();
    response.send(result);
})

app.get("/students",async(request,response)=>{
    const result= await getStudentsMentorNotAssigned();
    response.send(result);
})

app.get("/mentor/:name",async(request,response)=>{
    const name=request.params
    const mentor=await getStudesOfMentor(name);
    response.send(mentor);
})

app.put("/mentor/:name",async(request,response)=>{
    const name=request.params;
    
    // get students with unassigned mentors
    const students=await getStudentsMentorNotAssigned();

    // get id of student to whome to assign mentor
    const id=students[0]._id;

    // update student statue unssigned to assigned
    const status=await updateStudentById(id);
    
    // get student by id
    const student=await getStudentById(id);
    console.log(student)

    
    const result=await client.db("b28wd").collection("mentors").updateOne(name,{ $push: {students:student} })
    console.log(result)

    const rstmentor= await getStudesOfMentor(name)
    response.send(rstmentor)
})

app.get("/student/:id",async(request,response)=>{
    const id=request.params
    const student=await getStudentById(id);
    response.send(student);
})

app.put("/student/:id",async(request,response)=>{
    const id=request.params;
    const student=await updateStudentById(id);
    response.send(student);
})

app.listen(PORT,()=>console.log("App started in :",PORT));

async function getStudesOfMentor(name) {
    return await client.db("b28wd").collection("mentors").findOne(name, { projection: { students: 1 } });
}

async function getStudentById(id) {
    return await client.db("b28wd").collection("students").findOne({ _id: ObjectId(id) },{projection:{_id:0}});
}

async function updateStudentById(id) {
    return await client.db("b28wd").collection("students").updateOne({ _id: ObjectId(id) }, { $set: { mentor_assigned: "yes" } });
}

async function getStudentsMentorNotAssigned() {
    return await client.db("b28wd").collection("students").find({ mentor_assigned: "no" }).toArray();
}
