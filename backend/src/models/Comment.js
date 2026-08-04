const { Schema, model } = require('mongoose')

const commentSchema = new Schema({
  targetType: { type: String, enum: ['poem', 'profile'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  body: { type: String, required: true, maxlength: 1000 },
  parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  simulationRunId: { type: String, index: true },
  simulationKind: {
    type: String,
    enum: ['seed-poem-comment', 'seed-poem-reply', 'seed-profile-comment'],
    index: true
  }
}, { timestamps: true })

// The "My comments" tab: one author's comments, newest first.
//
// `createdAt` and not `updatedAt` — a comment has no collapse behaviour and an
// edit should not jump it to the top of your own history. `_id` tie-breaks for
// the reason it does everywhere else here: comments written in one batch (the
// AI seed writes hundreds) share a timestamp to the millisecond, and a
// paginated sort with arbitrary ties repeats rows across page boundaries while
// dropping others.
commentSchema.index({ authorId: 1, createdAt: -1, _id: -1 })

commentSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    const a = ret.authorId
    if (a && typeof a === 'object' && a.name) {
      ret.authorId = String(a.id || a._id)
      ret.authorName = a.name
      ret.authorPicture = a.picture || null
      ret.authorSlug = a.slug || null
      // Lets the client label AI-assisted comments where they appear, rather
      // than relying on a site-wide disclosure the reader may never scroll to.
      ret.authorType = a.type || null
    }
    delete ret.simulationRunId
    delete ret.simulationKind
  }
})

module.exports = model('Comment', commentSchema)
