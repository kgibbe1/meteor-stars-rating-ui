import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import service from './service'

const collection = new Mongo.Collection('star-ratings')

collection.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
})

Meteor.methods({
  'star-ratings.rate': (documentId, amount) => {
    check(documentId, String);
    check(amount, Number);

    if (!service.config().canRate()) {
      throw new Error('Not allowed to rate');
    }

    if (amount > 5 || amount < 1) {
      throw new Error('Amount is not in between 1 or 5: ' + amount)
    }

    const userId = service.config().getUserId()

    if (userId) {
      const docToFind = {
        documentId,
        userId
      }

      collection.update(docToFind, Object.assign({}, docToFind, { amount }), {
        upsert: true
      })
    }
  },
  'star-ratings.remove-rating': (documentId) => {
    if (!service.config().canRate()) {
      throw new Error('Not allowed to rate');
    }

    const userId = service.config().getUserId()

    if (userId) {
      collection.remove({
        documentId,
        userId
      })
    }
  }
})

export default collection
