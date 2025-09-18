// Backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Admin']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Admin']
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  message: {
    type: String,
    required: function () {
      return !this.fileUrl;
    },
    maxlength: 2000
  },
  fileUrl: { type: String, default: null },
  fileName: { type: String, default: null },
  fileType: { type: String, default: null },
  fileSize: { type: Number, default: null },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'announcement'],
    default: 'text'
  },
  isAnnouncement: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    refPath: 'deletedByModel'
  },
  deletedByModel: {
    type: String,
    enum: ['User', 'Admin'],
    default: null
  },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
    userModel: { type: String, enum: ['User', 'Admin'] },
    readAt: { type: Date, default: Date.now }
  }],
  edited: { type: Boolean, default: false },
  editedAt: { type: Date, default: null },
  originalMessage: { type: String, default: null }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
messageSchema.virtual('senderInfo', {
  ref: function () { return this.senderModel; },
  localField: 'sender',
  foreignField: '_id',
  justOne: true
});

messageSchema.virtual('receiverInfo', {
  ref: function () { return this.receiverModel; },
  localField: 'receiver',
  foreignField: '_id',
  justOne: true
});

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, createdAt: -1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ messageType: 1 });

// Pre-save middleware
messageSchema.pre('save', function (next) {
  if (this.isAnnouncement) {
    this.messageType = 'announcement';
  } else if (this.fileUrl) {
    this.messageType = (this.fileType && this.fileType.startsWith('image/'))
      ? 'image'
      : 'file';
  } else {
    this.messageType = 'text';
  }
  next();
});

// Static methods
messageSchema.statics.getConversationMessages = function (conversationId, options = {}) {
  const { limit = 50, skip = 0, includeDeleted = false } = options;
  const query = { conversation: conversationId, ...(includeDeleted ? {} : { isDeleted: false }) };

  return this.find(query)
    .populate('sender', 'name email isAdmin')
    .populate('receiver', 'name email isAdmin')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

messageSchema.statics.getAllMessages = function (options = {}) {
  const { limit = 100, skip = 0, includeDeleted = false, messageType = null, dateFrom = null, dateTo = null } = options;

  const query = {
    ...(includeDeleted ? {} : { isDeleted: false }),
    ...(messageType ? { messageType } : {}),
    ...(dateFrom || dateTo ? {
      createdAt: {
        ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { $lte: new Date(dateTo) } : {})
      }
    } : {})
  };

  return this.find(query)
    .populate('sender', 'name email isAdmin')
    .populate('receiver', 'name email isAdmin')
    .populate('conversation')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Instance methods
messageSchema.methods.softDelete = function (deletedBy, deletedByModel) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.deletedByModel = deletedByModel;
  return this.save();
};

messageSchema.methods.markAsRead = function (userId, userModel) {
  const alreadyRead = this.readBy.some(read =>
    read.user.toString() === userId.toString() && read.userModel === userModel
  );

  if (!alreadyRead) {
    this.readBy.push({ user: userId, userModel, readAt: new Date() });
    return this.save();
  }

  return Promise.resolve(this);
};

messageSchema.methods.editMessage = function (newMessage) {
  if (!this.originalMessage) {
    this.originalMessage = this.message;
  }
  this.message = newMessage;
  this.edited = true;
  this.editedAt = new Date();
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
