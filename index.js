const express = require('express');
const passport = require('passport');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const connectToDB= require('./config/db');

connectToDB();
dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());
// Initialize Passport middleware
app.use(passport.initialize());
app.use(cors());
// Body-parser middleware
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// Dev Logging Middleware
if (process.env.NODE_ENV === "development") {
    app.use(
        cors({
            origin: process.env.CLIENT_URL,
        })
    );
    app.use(morgan("dev"));
}

// Import Passport strategy
require('./config/passport')(passport);

app.use("/api/auth/", require("./routes/security/auth"));

/* All the apis are secured */
app.use("/api/trades/", require("./routes/services/trade"));
app.use("/api/cargo/", require("./routes/services/cargo"));
app.use("/api/inventory/", require("./routes/services/inventory"));
app.use("/api/updates/", require("./routes/services/updates"));
//to CRUD Address/Location
app.use("/api/location/", require("./routes/populators/location"));
//to CRUD SKU also product search based on filters
app.use("/api/sku/", require("./routes/populators/sku"));

app.use((req, res) => {
    res.status(404).json({
        success: false,
        msg: "Page not founded",
    });
});

// Set the port to listen to
const PORT = process.env.YOUR_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});