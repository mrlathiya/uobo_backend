const mongoose = require('mongoose');

const financeOrdersSchema = mongoose.Schema({
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
            ref: 'cars'
        },
        EMIOptions: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EMIOptios'
        }
    },
    dealerProvidedOptions: {
        carId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'cars'
        },
        EMIOptions: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EMIOptios'
        }
    },
    carPreference: {
        carType: [{
            type: String
        }],
        deliveryType: {
            type: String
        }, 
        makeAndModel: [{
            type: String
        }],
        priceRange: {
            start: {
                type: String
            },
            end: {
                type: String
            },
        },
        yearRange: {
            start: {
                type: String
            },
            end: {
                type: String
            },
        },
        milageRange: {
            start: {
                type: String
            },
            end: {
                type: String
            },
        },
        driveTrain: {
            type: String
        }, 
        transmission: {
            type: String
        },
        color: [{
            type: String
        }],
        fuel: {
            type: String
        }
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cars',
    },
    orderType: {
        type: String,
    },
    salutation: {
        type: String
    },
    category: {
        type: String,
        require: true
    },
    firstName: {
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
        }
    },
    address: [{
        address1: {
            type: String
        },
        address2: {
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
            
        }
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
        type: Boolean
    },
    customerDepositAmount: {
        type: Number
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
    deliveryDate: {
        date: {
            type: String
        },
        time: {
            type: String
        }
    },
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
        time: [{
            type: String
        }],
    }],
    EMIOptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EMIOptions',
    }],
    customerSelectedEMIOption: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EMIOptions'
    },
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
    billOfSale: {
        type: String
    }
});

module.exports = mongoose.model('live_orders', financeOrdersSchema);