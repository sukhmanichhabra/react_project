const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }));

async function fixMissingTags() {
  try {
    console.log('🔍 Finding properties with missing tags...');
    
    // Find properties without a tag field
    const propertiesWithoutTag = await Property.find({
      $or: [
        { tag: { $exists: false } },
        { tag: null },
        { tag: '' }
      ]
    });
    
    console.log(`Found ${propertiesWithoutTag.length} properties without tags`);
    
    for (const property of propertiesWithoutTag) {
      console.log(`\n📝 Property: ${property.title} (${property._id})`);
      console.log(`   Price: ${property.price}`);
      
      // Determine tag based on price format
      let tag = 'sale'; // default
      if (property.price && property.price.includes('/month')) {
        tag = 'rent';
      }
      
      console.log(`   Setting tag to: ${tag}`);
      
      // Update the property
      await Property.updateOne(
        { _id: property._id },
        { $set: { tag: tag } }
      );
      
      console.log(`   ✅ Updated!`);
    }
    
    console.log('\n✅ All properties fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMissingTags();
