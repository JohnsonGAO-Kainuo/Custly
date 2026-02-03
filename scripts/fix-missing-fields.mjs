// Add all missing fields that are causing 400 errors
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb-custly.kainuotech.com');

async function addField(collectionName, field) {
  try {
    const collection = await pb.collections.getOne(collectionName);
    
    if (collection.fields.some(f => f.name === field.name)) {
      console.log(`  ⚠️ ${field.name} already exists in ${collectionName}`);
      return;
    }

    const response = await fetch(`https://pb-custly.kainuotech.com/api/collections/${collection.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': pb.authStore.token
      },
      body: JSON.stringify({
        fields: [...collection.fields, field]
      })
    });

    if (response.ok) {
      console.log(`  ✅ Added ${field.name} to ${collectionName}`);
    } else {
      const error = await response.text();
      console.log(`  ❌ Failed to add ${field.name}: ${error}`);
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
  }
}

async function main() {
  await pb.collection('_superusers').authWithPassword('kainuotech@gmail.com', 'Gaodan123.');
  console.log('✅ Authenticated\n');

  // deals: add archived_at
  console.log('deals:');
  await addField('deals', { name: 'archived_at', type: 'date', required: false });

  // companies: add created_at
  console.log('\ncompanies:');
  await addField('companies', { name: 'created_at', type: 'autodate', onCreate: true, onUpdate: false });

  // Also check contacts for any missing fields that might be needed
  console.log('\ncontacts:');
  await addField('contacts', { name: 'created_at', type: 'autodate', onCreate: true, onUpdate: false });
  await addField('contacts', { name: 'updated_at', type: 'autodate', onCreate: true, onUpdate: true });

  // Test the queries
  console.log('\n📋 Testing queries...');
  
  try {
    await pb.collection('deals').getList(1, 1, { filter: 'archived_at = null' });
    console.log('  ✅ deals archived_at filter works');
  } catch (e) {
    console.log('  ❌ deals archived_at filter failed:', e.message);
  }

  try {
    await pb.collection('companies').getList(1, 1, { sort: '-created_at' });
    console.log('  ✅ companies created_at sort works');
  } catch (e) {
    console.log('  ❌ companies created_at sort failed:', e.message);
  }

  console.log('\n✅ Done!');
}

main();
