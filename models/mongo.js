const mongoose = require("mongoose");
const { Schema } = mongoose;

const Product = mongoose.model(
  "Product",
  new Schema(
    {
      name: String,
      price: Number,
      picture: String,
    },
    { collection: "products", autoCreate: true }
  )
);

const Cart = mongoose.model(
  "Cart",
  new Schema({
      userId: String,
      productId: String
    },
    { collection: "cart", autoCreate: true }
  )
);

exports.list = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await Product.find({});

      if (!products) {
        resolve({ success: false });
      } else {
        resolve({ success: true, products });
      }
    } catch (e) {
      reject({ success: false });
    }
  });
};

exports.get = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findOne({ id });

      if (!product) {
        resolve({ success: false });
      } else {
        resolve({ success: true, product });
      }
    } catch (e) {
      reject({ success: false });
    }
  });
};

exports.add = (product) => {
  return new Promise(async (resolve, reject) => {
    try {
      const productItem = new Product(product);
      await productItem.save();
      const products = await Product.find({});
      resolve({ success: true, products });
    } catch (e) {
      reject({ success: false });
    }
  });
};

exports.update = (product) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updated = await Product.updateOne(
          { _id: product.id },
          { $set: { name: product.name, price: product.price, picture: product.picture } }
      );
      if (!updated) {
        resolve({ success: false });
      } else {
        resolve({ success: true, product: updated });
      }
    } catch (e) {
      reject({ success: false });
    }
  });
};

exports.remove = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Product.deleteOne({ _id: id });
      resolve({ success: true });
    } catch (e) {
      reject({ success: false });
    }
  });
};

exports.getCartList = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let cart = await Cart.find({ userId });
      const products = await Promise.all(
        cart.map((item) => Product.findOne({ _id: item.productId }))
      );
      if (cart.length) {
        resolve({ success: true, cart: products });
      } else {
        resolve({ success: false });
      }
    } catch (e) {
      reject({ success: false });
    }
  });
};

exports.addToCart = (userId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cartItem = new Cart({ userId: userId, productId: id });
      const item = await cartItem.save();
      resolve({ success: true, item });
    } catch (e) {
      reject({ success: false });
    }
  });
};

exports.removeFromCart = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await Cart.deleteOne({ productId: id });
      resolve({ success: true });
    } catch (e) {
      reject({ success: false });
    }
  });
};

mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true }, (err) => {
  if (err) throw err;
});

let db = mongoose.connection;
db.once("open", () => console.log(`connected to ${process.env.MONGO_DB}`));
db.on("error", (error) => {
  console.log("error", error.message);
});
