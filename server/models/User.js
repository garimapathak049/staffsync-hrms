const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['HR', 'MANAGER', 'EMPLOYEE'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, index: true },
    employeeId: { type: String, unique: true, sparse: true, trim: true },
    department: { type: String, trim: true, index: true },
    designation: { type: String, trim: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    phone: { type: String, trim: true },
    profileImage: { type: String },
    accountStatus: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    joiningDate: { type: Date, default: Date.now },
    mustChangePassword: { type: Boolean, default: false },
    // Sensitive: excluded from queries by default; only HR endpoints may select it explicitly
    salary: { type: Number, select: false, min: 0 },
    emergencyContact: { name: String, phone: String, relation: String },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 12);
};

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
