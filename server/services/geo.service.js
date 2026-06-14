const User = require('../models/User');
const Donation = require('../models/Donation');
const emailService = require('./email.service');
const smsService = require('./sms.service');

const sendNotifications = async (users, donation) => {
  // Using localhost:3000 as default client URL, can be configured in .env
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const claimLink = `${baseUrl}/ngo/claim/${donation._id}`;
  
  for (const user of users) {
    // Send Email via Nodemailer
    if (user.email) {
      const emailSubject = `New Food Donation Available: ${donation.foodType}`;
      const emailHtml = `
        <h3>New Donation near you!</h3>
        <p><strong>Food Type:</strong> ${donation.foodType}</p>
        <p><strong>Quantity:</strong> ${donation.quantity}</p>
        <p><strong>Pickup Area:</strong> ${donation.pickupAddress}</p>
        <p><a href="${claimLink}">Click here to claim this donation</a></p>
      `;
      await emailService.sendEmail(user.email, emailSubject, emailHtml);
    }

    // Send SMS via Twilio
    if (user.phone) {
      const smsBody = `Food Relief: New ${donation.foodType} (${donation.quantity}) available near ${donation.pickupAddress}. Claim here: ${claimLink}`;
      await smsService.sendSMS(user.phone, smsBody);
    }
  }
};

const notifyNearbyNGOs = async (donation) => {
  try {
    const coordinates = donation.location.coordinates;
    const maxDistanceInMeters = 15000; // 15km radius

    console.log(`[${new Date().toISOString()}] [GEO SERVICE] Starting notifications for donation ${donation._id}`);

    // Since the location field is in the User model, we query User 
    // and $lookup to filter for approved general NGOs
    const initialUsers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: coordinates
          },
          distanceField: "distance",
          maxDistance: maxDistanceInMeters,
          query: { role: 'ngo' },
          spherical: true
        }
      },
      {
        $lookup: {
          from: 'ngos', // Ensure this matches MongoDB's pluralization 'ngos'
          localField: '_id',
          foreignField: 'userId',
          as: 'ngoDetails'
        }
      },
      {
        $unwind: '$ngoDetails'
      },
      {
        $match: {
          'ngoDetails.approvalStatus': 'approved',
          'ngoDetails.category': 'general_ngo' // Phase 1
        }
      }
    ]);

    console.log(`[${new Date().toISOString()}] [GEO SERVICE] Found ${initialUsers.length} general NGOs nearby.`);
    await sendNotifications(initialUsers, donation);

    // Schedule 30-minute check to expand notifications
    const THIRTY_MINUTES = 30 * 60 * 1000;
    setTimeout(async () => {
      try {
        console.log(`[${new Date().toISOString()}] [GEO SERVICE] 30-minute check for donation ${donation._id}`);
        
        // Re-fetch the donation to ensure it hasn't been claimed or cancelled
        const currentDonation = await Donation.findById(donation._id);
        
        if (currentDonation && currentDonation.status === 'open') {
          console.log(`[${new Date().toISOString()}] [GEO SERVICE] Donation ${donation._id} still open. Expanding radius...`);
          
          const expandedUsers = await User.aggregate([
            {
              $geoNear: {
                near: {
                  type: "Point",
                  coordinates: coordinates
                },
                distanceField: "distance",
                maxDistance: maxDistanceInMeters,
                query: { role: 'ngo' },
                spherical: true
              }
            },
            {
              $lookup: {
                from: 'ngos',
                localField: '_id',
                foreignField: 'userId',
                as: 'ngoDetails'
              }
            },
            {
              $unwind: '$ngoDetails'
            },
            {
              $match: {
                'ngoDetails.approvalStatus': 'approved',
                'ngoDetails.category': { $in: ['orphanage', 'old_age_home', 'school'] } // Phase 2
              }
            }
          ]);

          console.log(`[${new Date().toISOString()}] [GEO SERVICE] Found ${expandedUsers.length} expanded NGOs nearby.`);
          await sendNotifications(expandedUsers, currentDonation);
        } else {
          console.log(`[${new Date().toISOString()}] [GEO SERVICE] Donation ${donation._id} already claimed or cancelled. No further notifications.`);
        }
      } catch (err) {
        console.error(`[${new Date().toISOString()}] [GEO SERVICE] Error in timeout check:`, err.message);
      }
    }, THIRTY_MINUTES);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] [GEO SERVICE] Error:`, error.message);
  }
};

module.exports = { notifyNearbyNGOs };
