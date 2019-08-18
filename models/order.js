const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    shipping: {
        type: Number,
        default: 0
    },
    paymentMethod: [{
        method: {
            type: String,
            default: 'Stripe'
        },
        transactionId: {
            type: Number,
            default: 0000000000000000000000000
        },
        transactionStatus: {
            type: String,
            default: ''
        }
    }],
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    created: {
        type: Date
    },
    updated: {
        type: Date
    },
    status: {
        type: String,
        default: 'Pending'
    }
});

//before save hook!!  need to include dates.
OrderSchema.pre("save", function (next) {
    var order = this;
    //set created and updated date
    now = new Date();
    order.updated = now;
    if (!order.created) {
        order.created = now;
    }
    next();
});

module.exports = mongoose.model('Order', OrderSchema);