const app = require('./src/app');

const PORT = process.env.DEV_APP_PORT || 3000;
 app.listen( PORT , () =>{
    console.log(`WVS eCommerce start with ${PORT}`);
});
