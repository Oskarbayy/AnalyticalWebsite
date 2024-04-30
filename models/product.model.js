const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      requried: [true, "Please enter product name"],
    },

    quantity: {
      type: Number,
      requried: true,
      default: 0,
    },

    price: {
      type: Number,
      requried: true,
      default: 0,
    },

    image: {
      type: String,
      requried: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
