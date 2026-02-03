// Fix relation fields for PocketBase v0.23+
// In newer versions, collectionId is a direct field property, not in options

import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb-custly.kainuotech.com');

async function main() {
  try {
    // Authenticate as admin
    await pb.collection('_superusers').authWithPassword('kainuotech@gmail.com', 'Gaodan123.');
    console.log('✅ Authenticated');

    // Get all collection IDs
    const collections = await pb.collections.getFullList();
    const collectionMap = {};
    for (const c of collections) {
      collectionMap[c.name] = c.id;
    }
    console.log('\nCollection IDs:', collectionMap);

    // Get current contacts collection
    const contacts = await pb.collections.getOne(collectionMap['contacts']);
    console.log('\n📋 contacts current fields:', contacts.fields.length);

    // Check if company_id already exists
    const hasCompanyId = contacts.fields.some(f => f.name === 'company_id');
    if (hasCompanyId) {
      console.log('⚠️ company_id already exists, skipping');
    } else {
      // Add company_id relation field using correct format
      // In PocketBase v0.23+, collectionId is a direct field property
      const newField = {
        name: 'company_id',
        type: 'relation',
        required: false,
        system: false,
        hidden: false,
        presentable: false,
        collectionId: collectionMap['companies'],  // Direct property, not in options!
        cascadeDelete: false,
        minSelect: 0,
        maxSelect: 1
      };

      console.log('\nAdding relation field:', JSON.stringify(newField, null, 2));

      const updatedFields = [...contacts.fields, newField];

      const response = await fetch(`https://pb-custly.kainuotech.com/api/collections/${contacts.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': pb.authStore.token
        },
        body: JSON.stringify({
          fields: updatedFields
        })
      });

      if (response.ok) {
        console.log('✅ Successfully added company_id to contacts!');
        const updated = await response.json();
        console.log('New fields count:', updated.fields.length);
      } else {
        const error = await response.text();
        console.log('❌ Failed:', error);
      }
    }

    // Verify
    const verify = await pb.collections.getOne(collectionMap['contacts']);
    console.log('\n📋 Final contacts fields:', verify.fields.map(f => f.name).join(', '));

  } catch (err) {
    console.error('Error:', err);
  }
}

main();
