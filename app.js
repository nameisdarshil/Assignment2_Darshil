const express = require('express');
const path = require('path');
const app = express();
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars'); 
const bodyParser = require('body-parser');
const fs = require("fs");
const port = process.env.port || 3000;

// Middleware to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Custom Handlebars helper to format reviews
Handlebars.registerHelper('formatReviews', function(reviews) {
  if (reviews === 0 || reviews === "0") {
      return new Handlebars.SafeString('<span style="background-color: yellow; color: red;">N/A</span>');
  } else {
      return reviews;
  }
});

// Custom Handlebars helper to check if reviews count is zero
Handlebars.registerHelper('isZeroReviews', function(reviews) {
  return reviews === 0 || reviews === "0";
});


app.get('/allData', (req, res) => {
  res.render('partials/allData', { products: jsonData });
});

app.engine('.hbs', exphbs.engine({ extname:'.hbs' }));
app.set('view engine', '.hbs');

app.get('/', function(req, res) {
  res.render('partials/index', { title: 'Express' });
});

// Handle requests to the "/users" URL
app.get('/users', function(req, res) {
  res.send('respond with a resource');
});

app.use(bodyParser.urlencoded({ extended: true }));

// Load JSON data
let jsonData = [];
const newFilePath = "datasetB.json";

fs.readFile(newFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading JSON file:", err);
        throw err;
    }
    jsonData = JSON.parse(data);
    console.log("JSON data loaded successfully.");
});


app.get('/data', (req, res) => {
    res.render('partials/data', { jsonData });
});

app.get('/data/product/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < jsonData.length) {
        const product = jsonData[index];
        res.render('partials/product', { product });
    } else {
        res.status(400).render('partials/error', { title: 'Error', message: 'Invalid index' });
    }
});

app.get('/data/search/prdID', (req, res) => {
    res.render('partials/searchID');
});

app.post('/data/search/prdID', (req, res) => {
    const productId = req.body.asin;
    const productInfo = jsonData.find(product => product.asin === productId);
    if (productInfo) {
        res.render('partials/product', { product: productInfo });
    } else {
        res.status(404).render('partials/error', { title: 'Error', message: 'Product not found' });
    }
});

app.get('/data/search/prdName', (req, res) => {
    res.render('partials/searchName');
});

app.post('/data/search/prdName', (req, res) => {
  const productName = req.body.productName.trim().toLowerCase(); 
  
  // Filter products based on case-insensitive match with product name
  const matchedProducts = jsonData.filter(product => product.title.toLowerCase().includes(productName));

  if (matchedProducts.length > 0) {
      // Displaying details for each matched product
      const productInfo = matchedProducts.map(product => {
          const { title, category, price } = product;
          return { title, category, price };
      });
      res.render('partials/product', { products: productInfo }); // Render the productList view with matched products
  } else {
      res.render('partials/error', { title: 'Error', message: 'No products found' }); // Render an error message if no products found
  }
});


// Handle requests to any other URL
app.get('*', function(req, res) {
  res.render('partials/error', { title: 'Error', message:'Wrong Route' });
});
// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})