const mongoose = require('mongoose');

const deletedUserSchema = mongoose.Schema(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        middleName: {
            type: String
        },
        salutation: {
            type: String
        },
        preferName: {
            type: String
        },
        email: {
            type: String
        },
        contact: {
            countryCode: {
                type: Number
            },
            number: {
                type: Number
            }
        },
        gender: {
            type: String
        },
        height: {
            type: Number
        },
        age: {
            type: Number
        },
        DOB: {
            type: String
        },
        fcmToken: {
            type: String
        },
        address: {
            address1: {
                type: String
            },
            address2: {
                type: String
            },
            postcode: {
                type: String
            },
        },
        currentLocation: {
            lat: {
                type: Number
            },
            long: {
                type: Number
            },
        },
        issued: {
            type: String
        },
        licenceDetails: {
            licenceNumber: {
                type: String
            },
            class: {
                type: String
            },
            dateOfExpiry: {
                type: Date
            },
            dl_front_image: {
                type: String
            },
            dl_back_image: {
                type: String
            },
            isVerify: {
                type: Boolean,
                default: false
            }
        },
        issuerOrg_region_full: {
            type: String
        },
        issuerOrg_region_abbr: {
            type: String
        },
        issuerOrg_full: {
            type: String
        },
        issuerOrg_iso2: {
            type: String
        },
        issuerOrg_iso3: {
            type: String
        },
        nationality_full: {
            type: String
        },
        nationality_iso2: {
            type: String
        },
        nationality_iso3: {
            type: String
        },
        eyeColor: {
            type: String
        },
        internalId: {
            type: String
        },
        vaultid: {
            type: String
        },
        matchrate: {
            type: Number
        },
        executionTime: {
            type: Number
        },
        responseID: {
            type: String
        },
        quota: {
            type: Number
        },
        credit: {
            type: Number
        },
        houseOwnership: {
            ownershipType: {
                type: String
            },
            monthlyRentAmount: {
                type: String
            },
            mortgageDetails: {
                amount: {
                    type: String
                },
                bank: {
                    type: String
                },
                marketValue: {
                    type: String
                },
                monthlyMortgage: {
                    type: String
                },
                comment: {
                    type: String
                }
            }
        },
        currentEmployment: [{
            status: {
                type: String
            },
            type: {
                type: String
            },
            occupation: {
                type: String
            },
            employer: {
                type: String
            },
            workLocation: {
                address: {
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
                telephone: {
                    type: String
                },
                extension: {
                    type: String
                },
            },
            jobDuration: {
                year: {
                    type: String
                },
                month: {
                    type: String
                },
                
            },
        }],
        grossIncome: {
            income: {
                type: String
            },
            perMQY: {
                type: String
            }
        },
        otherIncomeSource: {
            type: {
                type: String
            },
            income: {
                type: String
            },
            perMQY: {
                type: String
            },    
        },
        SIN: {
            type: String
        },
        documents: [
            {
                type: {
                    type: String
                },
                file: {
                    type: String
                }
            }
        ],
        preferredDeliveryMode: {
            type: String,
        },
        marriedStatus: {
            type: String
        },
        reason: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('deletedCustomers', deletedUserSchema);