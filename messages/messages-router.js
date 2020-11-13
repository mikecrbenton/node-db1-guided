const express = require("express")
const db = require("../data/config")

const router = express.Router()

router.get("/", async(req, res, next) => {
   try {
      //SELECT * FROM messages
      const messages = await db.select("*").from("messages")
      res.json(messages)
   }catch(err){
      next(err)
   }
})

router.get("/:id", async(req, res, next) => {
   try {
      //SELECT * FROM messages WHERE id = ? LIMIT 1
      const [message] = await db      //NOTICE THE VARIABLE IS DESTRUCTED SO IT IS ONLY AN OBJECT, NOT IN AN ARRAY
         .select("*")
         .from("messages")
         .where("id", req.params.id)
         .limit(1)

      res.json(message)
   }catch(err){
      next(err)
   }
})

router.post("/", async(req, res, next) => {
   try{
      // NEVER NEVER NEVER pass requests into the database without checks in place (SQL injections)
      const payload = {
         title : req.body.title,
         contents : req.body.contents
      }

      if(!payload.title || !payload.contents) {
         return res.status(400).json( {message: "Need title and content"})
      }

      // INSERT INTO messages { title, contents} VALUES ( ?, ?)
      const [id] = await db.insert(payload).into("messages")
      // YOU ARE NOT LIMITED TO HOW MANY DB CALLS YOU CAN MAKE IN AN ENDPOINT
      const message = await db
         .first("*") // shortcut instead of having to [destructure] and LIMIT 1
         .from("messages")
         .where("id", id)

      res.status(201).json(message)

   }catch(err){
      next(err)
   }
})

router.put("/:id", async(req, res, next) => {
   try{
      const payload = {
         title : req.body.title,
         contents : req.body.contents
      }

      if(!payload.title || !payload.contents) {
         return res.status(400).json( {message: "Need title and content"})
      }

      // UPDATE messages SET title = ? AND contents = WHERE id= ?
      // DON'T NEED A VARIABLE
      await db("messages").where("id", req.params.id).update(payload)

      // RETURN UPDATED MESSAGE
      const message = await db
      .first("*") // shortcut instead of having to [destructure] and LIMIT 1
      .from("messages")
      .where("id", req.params.id)

      res.json(message)
      
   }catch(err){
      next(err)
   }
})

router.delete("/:id", async(req, res, next) => {
   try{
      // DELETE FROM  messages WHERE id = ?  // DON'T FORGET WHERE!!!  DON'T DELETE YOUR DATABASE
      await db("messages").where("id", req.params.id).del()
      res.status(204).end() // no resource to return 204 = success empty response
      
   }catch(err){
      next(err)
   }
})

module.exports = router