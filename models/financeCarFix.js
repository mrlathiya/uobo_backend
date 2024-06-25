const { default: mongoose } = require('mongoose');
const mognoose = require('mongoose');

const financeCashFixSchema = mognoose.Schema({
    dealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dealers',
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'inventory',
    },
    orderType: {
        type: String,
        default: 'FinanceWithCar'
    },
    salutation: {
        type: String
    },
    fistName: {
        type: String
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    contact: {
        countryCode: {
            type: String
        },
        number: {
            type: String
        },
    },
    address: [{
        address1: {
            type: String
        },
        address2: {
            type: String
        },
        addressType: {
            type: String
        },
        city: {
            type: String
        },
        postalCode: {
            type: String
        },
        province: {
            type: String
        },
        suitNumber: {
            type: String
        },
        stayDuration: {
            year: {
                type: String
            },
            month: {
                type: String
            },
            
        },
    }],
    gender: {
        type: String
    },
    DOB: {
        type: String
    },
    documents: [{
        category: {
            type: String
        },
        file: {
            type: String
        }
    }],
    status: {
        type: String
    },
    isTradeinCarAvilable: {
        type: Boolean
    },
    financeApproval: {
        type: String
    },
    customerDepositAmount: {
        type: Number
    },
    tradeDetails: {
        dealerEstimatedTradeValue: {
            type: Number
        },
        VIN: {
            type: String
        },
        YearMakeModel: {
            type: String
        },
        odometerReading: {
            type: String
        },
        trim: {
            type: String
        },
        transmission: {
            type: String
        },
        color: {
            type: String
        },
        ownerShip: {
            type: String
        },
        loanType: {
            type: String
        },
        amount: {
            type: Number
        },
        remainingPayment: {
            type: Number
        },
        EMIAmount: {
            type: Number
        },
        accidentHistory: {
            damageAmount: {
                type: Number
            },
            insurancePayoutAmount: {
                type: Number
            },
        },
        mechanicalIssue: [{
            type: String
        }],
        warningLight: [{
            type: String
        }],
        afterMarketModification: [{
            type: String
        }],
        additionalIsuse: [{
            type: String
        }],
        estimatedBodyWorkAmount: {
            type: Number
        },
        smoke: {
            type: Boolean
        },
        photos: [{
            type: String
        }]
    },
    EMIOptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EMIOptions',
    }],
    isTradeinCarAvilable: {
        type: Boolean
    },
    additionalDocuments: [
        {
            nameOfDocument: {
                type: String
            },
            explanation: {
                type: String
            }
        }
    ],
    billOfSale: {
        type: String,
        default: ''
    },
    appointments: [{
        date: {
            type: String
        },
        time: [{
            type: String
        }],
    }],
    deliveryAddress: {
        address1: {
            type: String
        },
        address1: {
            type: String
        },
        city: {
            type: String
        },
        postalCode: {
            type: String
        },
    },
});

module.exports = mognoose.model('financeCashFix', financeCashFixSchema);