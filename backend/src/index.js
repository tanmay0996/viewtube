// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"          // we want env variable load as early as possible so we put them in main file(index.js) and at the top position

import connectDB from "./db/index.js"
import {app} from "./app.js"

dotenv.config({
    path:'./.env'
})


connectDB()    // ek promise return kar raha
.then(() => {
    app.on("error",(error) => {
        // Set up error handling for the express app
        console.log("Error in conn ExpressApp",error)
        throw error
         
       })
       // Start the server on the specified port
    app.listen(process.env.PORT|| 8000, () => {
        console.log(`Server is running on port:${process.env.PORT}`);
        
      
    }
    )
  
}
)
.catch((error) => {
     // Handle any errors that occur during the MongoDB connection
    console.log("MONGODB CONNECTION FAiled!!!",error);
  
}
)



  






/*
import express from "express"
const app=express()

;(async() => {                         //EFFI
    try {
      await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",(error) => {
        console.log("Error in conn ExpressApp",error)
        throw error
         
       }
       )
       app.listen(process.env.PORT, () => {
        console.log(`App is listening on port:${process.env.PORT}`)
         
       }
       )
        
    } catch (error) {
        console.error("ERROR:",error)
        throw error
        
    }
  
}
)()                                   //Effi
 */                                  