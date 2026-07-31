const app = require('./src/app')

const PORT = process.env.DEV_APP_PORT || 3000
const server =  app.listen( PORT , () =>{
    console.log(`WVS eCommerce start with ${PORT}`)
})
