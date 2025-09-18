// Backend/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'participants.userModel' },
    userModel: { type: String, required: true, enum: ['User', 'Admin'] },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true }
  }],
  conversationType: { type: String, enum: ['direct', 'admin-user', 'admin-broadcast'], default: 'direct' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  lastActivity: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date, default: null },
  archivedBy: { type: mongoose.Schema.Types.ObjectId, default: null, refPath: 'archivedByModel' },
  archivedByModel: { type: String, enum: ['User', 'Admin'], default: null },
  title: { type: String, default: null, maxlength: 100 },
  description: { type: String, default: null, maxlength: 500 },
  settings: {
    allowUserToUser: { type: Boolean, default: false },
    adminApprovalRequired: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    approvedAt: { type: Date, default: null }
  },
  metadata: {
    messageCount: { type: Number, default: 0 },
    fileCount: { type: Number, default: 0 },
    lastReadBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, refPath: 'metadata.lastReadBy.userModel' },
      userModel: { type: String, enum: ['User', 'Admin'] },
      lastReadAt: { type: Date, default: Date.now },
      unreadCount: { type: Number, default: 0 }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ conversationType: 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ isArchived: 1 });
conversationSchema.index({ 'settings.isApproved': 1 });

// Virtual for active participants
conversationSchema.virtual('activeParticipants').get(function () {
  return this.participants.filter(p => p.isActive);
});

// Static methods
conversationSchema.statics.findBetweenUsers = function (user1Id, user1Model, user2Id, user2Model) {
  return this.findOne({
    $and: [
      { participants: { $elemMatch: { user: user1Id, userModel: user1Model, isActive: true } } },
      { participants: { $elemMatch: { user: user2Id, userModel: user2Model, isActive: true } } }
    ],
    conversationType: 'direct',
    isArchived: false
  });
};

conversationSchema.statics.getAdminUserConversation = function (userId, adminId) {
  return this.findOne({
    $and: [
      { participants: { $elemMatch: { user: userId, userModel: 'User', isActive: true } } },
      { participants: { $elemMatch: { user: adminId, userModel: 'Admin', isActive: true } } }
    ],
    conversationType: 'admin-user',
    isArchived: false
  });
};

conversationSchema.statics.getUserConversations = function (userId, userModel) {
  return this.find({
    participants: { $elemMatch: { user: userId, userModel, isActive: true } },
    isArchived: false
  })
  .populate('lastMessage')
  .populate('participants.user', 'name email isAdmin')
  .sort({ lastActivity: -1 });
};

conversationSchema.statics.getOrCreateAdminConversation = async function (userId, adminId) {
  let conversation = await this.getAdminUserConversation(userId, adminId);
  if (!conversation) {
    conversation = new this({
      participants: [
        { user: userId, userModel: 'User' },
        { user: adminId, userModel: 'Admin' }
      ],
      conversationType: 'admin-user',
      settings: {
        allowUserToUser: false,
        adminApprovalRequired: false,
        isApproved: true,
        approvedBy: adminId,
        approvedAt: new Date()
      }
    });
    await conversation.save();
  }
  return conversation;
};

// Instance methods
conversationSchema.methods.addParticipant = function (userId, userModel) {
  const existing = this.participants.find(p => p.user.toString() === userId.toString() && p.userModel === userModel);
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      existing.leftAt = null;
      existing.joinedAt = new Date();
    }
  } else {
    this.participants.push({ user: userId, userModel });
  }
  return this.save();
};

conversationSchema.methods.removeParticipant = function (userId, userModel) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString() && p.userModel === userModel);
  if (participant) {
    participant.isActive = false;
    participant.leftAt = new Date();
  }
  return this.save();
};

conversationSchema.methods.updateLastActivity = function (messageId = null) {
  this.lastActivity = new Date();
  if (messageId) this.lastMessage = messageId;
  this.metadata.messageCount += 1;
  return this.save();
};

conversationSchema.methods.archive = function (archivedBy, archivedByModel) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = archivedBy;
  this.archivedByModel = archivedByModel;
  return this.save();
};

conversationSchema.methods.approve = function (approvedBy) {
  this.settings.isApproved = true;
  this.settings.approvedBy = approvedBy;
  this.settings.approvedAt = new Date();
  return this.save();
};

conversationSchema.methods.updateUnreadCount = function (userId, userModel, increment = true) {
  let userRead = this.metadata.lastReadBy.find(r => r.user.toString() === userId.toString() && r.userModel === userModel);
  if (!userRead) {
    userRead = { user: userId, userModel, lastReadAt: new Date(), unreadCount: 0 };
    this.metadata.lastReadBy.push(userRead);
  }
  if (increment) userRead.unreadCount += 1;
  else { userRead.unreadCount = 0; userRead.lastReadAt = new Date(); }
  return this.save();
};

conversationSchema.methods.getOtherParticipants = function (currentUserId, currentUserModel) {
  return this.participants.filter(p => p.isActive && !(p.user.toString() === currentUserId.toString() && p.userModel === currentUserModel));
};

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
