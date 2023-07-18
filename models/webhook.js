const { Schema, model } = require('mongoose');

const webhookSchema = Schema({
    name: {
        type: String,
    }
}, { collection: 'webhook' });

webhookSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
})

module.exports = model('webhook', webhookSchema);