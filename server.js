require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running. Use our API on port: ${port}`);
});

// const app = require('./app')
// app.listen(3000, () => {
//   console.log("Server running. Use our API on port: 3000")
// })
