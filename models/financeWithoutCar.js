const { default: mongoose } = require('mongoose');
const mognoose = require('mongoose');

const financeWithoutCarSchema = mognoose.Schema({
    dealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dealers',
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    customerSelectedCar: {
        carId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'inventory'
        },
        EMIOptions: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EMIOptios'
        }
    },
    dealerProvidedOptions: {
        carId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'inventory'
        },
        EMIOptions: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EMIOptios'
        }
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
    appointments: [{
        date: {
            type: String
        },
        time: {
            type: String
        },
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
    orderType: {
        type: String,
        default: 'FinanceWithoutCar'
    },
});

module.exports = mognoose.model('financeWithoutCar', financeWithoutCarSchema);