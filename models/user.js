// models/user.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Corresponds to 'passwordHash' in your diagram
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      // You can set required: true if phone number is mandatory for registration
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Used for administrative blocking as per your model
    isBlock: {
      type: Boolean,
      default: false,
    },
    // Array of ObjectIds linking to the Address collection
    address_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
      },
    ],
  },
  {
    timestamps: true, // Includes createdAt and updatedAt fields
  }
);

// Middleware to hash the password before saving (e.g., on user registration or password update)
// NOTE: Async functions in Mongoose middleware should NOT call next()
userSchema.pre('save', async function () {
  console.log("PRE-SAVE: Starting password hash middleware");
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    console.log("PRE-SAVE: Password not modified, skipping hash");
    return;
  }

  console.log("PRE-SAVE: Generating salt...");
  const salt = await bcrypt.genSalt(10);
  console.log("PRE-SAVE: Salt generated, hashing password...");
  this.password = await bcrypt.hash(this.password, salt);
  console.log("PRE-SAVE: Password hashed successfully");
});

// Instance method to compare the entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Uses bcrypt to compare the plain text password with the stored hash
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;