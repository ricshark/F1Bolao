const mongoose = require('mongoose');

// MONGODB_URI will be provided by node --env-file=.env.local
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment');
  process.exit(1);
}

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const Bet = mongoose.models.Bet || mongoose.model('Bet', new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }));
    
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));

    console.log('Fetching all bets...');
    const bets = await Bet.find({});
    console.log(`Found ${bets.length} total bets.`);

    let deletedCount = 0;
    for (const bet of bets) {
      if (bet.user) {
        const userExists = await User.exists({ _id: bet.user });
        if (!userExists) {
          console.log(`Deleting bet ${bet._id} - User ${bet.user} no longer exists.`);
          await Bet.deleteOne({ _id: bet._id });
          deletedCount++;
        }
      } else {
        console.log(`Deleting bet ${bet._id} - No user assigned.`);
        await Bet.deleteOne({ _id: bet._id });
        deletedCount++;
      }
    }

    console.log('---------------------------------');
    console.log(`Cleanup finished. Removed ${deletedCount} orphaned bets.`);
    console.log('---------------------------------');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanup();
