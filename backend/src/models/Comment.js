const { Schema, model } = require('mongoose')

const commentSchema = new Schema({
  targetType: { type: String, enum: ['poem', 'profile'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  body: { type: String, required: true, maxlength: 1000 },
  parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }
}, { timestamps: true })

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
    }
  }
})

module.exports = model('Comment', commentSchema)
