const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./models/Doctor');

// Load environment variables (to get your MONGO_URI)
dotenv.config();

const realisticDoctors = [
  {
    name: "Dr. Sanath Perera",
    specialty: "Cardiologist",
    hospital: "Asiri Surgical Hospital",
    experience: "15 Years",
    rating: 4.9,
    patients: "2.5K+",
    fee: "Rs. 3500",
    imageUrl: "👨‍⚕️" // Using emojis temporarily for mobile UI avatars
  },
  {
    name: "Dr. Nethmi Fernando",
    specialty: "Pediatrician",
    hospital: "Hemas Hospital Wattala",
    experience: "10 Years",
    rating: 4.8,
    patients: "4K+",
    fee: "Rs. 2500",
    imageUrl: "👩‍⚕️"
  },
  {
    name: "Dr. Kamal Gunawardena",
    specialty: "Neurologist",
    hospital: "Lanka Hospitals",
    experience: "20 Years",
    rating: 4.7,
    patients: "1.2K+",
    fee: "Rs. 4000",
    imageUrl: "👨‍⚕️"
  },
  {
    name: "Dr. Shalini Silva",
    specialty: "Dermatologist",
    hospital: "Nawaloka Hospital",
    experience: "8 Years",
    rating: 4.9,
    patients: "3K+",
    fee: "Rs. 3000",
    imageUrl: "👩‍⚕️"
  },
  {
    name: "Dr. Roshan Rajapakse",
    specialty: "Orthopedic Surgeon",
    hospital: "Medihelp Hospital",
    experience: "12 Years",
    rating: 4.6,
    patients: "1.8K+",
    fee: "Rs. 3000",
    imageUrl: "👨‍⚕️"
  }
];

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 2. Delete any existing doctors so we don't get duplicates
    await Doctor.deleteMany();
    console.log("Cleared old doctor data...");

    // 3. Insert the new realistic doctors
    await Doctor.insertMany(realisticDoctors);
    console.log("✅ Successfully injected Sri Lankan doctors into the database!");

    // 4. Disconnect
    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the function
seedDatabase();