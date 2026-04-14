import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: String,
  price: Number,
  //category: String,
  image: String,
  //description:String
});
//const Food = mongoose.model("Food",foodSchema);

export default mongoose.model("Food", foodSchema);