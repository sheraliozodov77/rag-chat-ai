import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { type: String, required: false, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profileInfo: {
    firstName: String,
    lastName: String,
    bio: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash password
userSchema.pre('save', function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  bcrypt.hash(this.passwordHash, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.passwordHash = hash;
    next();
  });
});

const User = mongoose.model('User', userSchema);

export default User;
