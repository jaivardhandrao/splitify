const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  phone: { type: String },
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String, sparse: true, unique: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  profilePicture: { type: String },
  upiId: { type: String, default: '' },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  ownedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
}, { timestamps: true });

// Hash password before saving (only for local auth)
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password on login (only for local auth)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Google users don't have password
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);