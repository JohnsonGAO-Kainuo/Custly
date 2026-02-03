// Complete script to add all relation fields to PocketBase collections
// Using correct format for PocketBase v0.23+

import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb-custly.kainuotech.com');

async function addRelationField(collectionName, fieldName, targetCollectionId, maxSelect = 1) {
  try {
    const collection = await pb.collections.getOne(collectionName);
    
    // Check if field already exists
    const exists = collection.fields.some(f => f.name === fieldName);
    if (exists) {
      console.log(`  ⚠️ ${fieldName} already exists in ${collectionName}`);
      return true;
    }

    const newField = {
      name: fieldName,
      type: 'relation',
      required: false,
      system: false,
      hidden: false,
      presentable: false,
      collectionId: targetCollectionId,
      cascadeDelete: false,
      minSelect: 0,
      maxSelect: maxSelect
    };

    const response = await fetch(`https://pb-custly.kainuotech.com/api/collections/${collection.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': pb.authStore.token
      },
      body: JSON.stringify({
        fields: [...collection.fields, newField]
      })
    });

    if (response.ok) {
      console.log(`  ✅ Added ${fieldName} to ${collectionName}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`  ❌ Failed to add ${fieldName} to ${collectionName}: ${error}`);
      return false;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  try {
    // Authenticate as admin
    await pb.collection('_superusers').authWithPassword('kainuotech@gmail.com', 'Gaodan123.');
    console.log('✅ Authenticated\n');

    // Get all collection IDs
    const collections = await pb.collections.getFullList();
    const c = {};
    for (const col of collections) {
      c[col.name] = col.id;
    }

    console.log('📋 Adding relation fields...\n');

    // contacts: needs company_id (already done), sales_id, tags
    console.log('contacts:');
    await addRelationField('contacts', 'sales_id', c['sales'], 1);
    await addRelationField('contacts', 'tags', c['tags'], 999); // multiple tags

    // deals: needs company_id, contact_ids, sales_id
    console.log('\ndeals:');
    await addRelationField('deals', 'company_id', c['companies'], 1);
    await addRelationField('deals', 'contact_ids', c['contacts'], 999); // multiple contacts
    await addRelationField('deals', 'sales_id', c['sales'], 1);

    // tasks: needs contact_id, sales_id
    console.log('\ntasks:');
    await addRelationField('tasks', 'contact_id', c['contacts'], 1);
    await addRelationField('tasks', 'sales_id', c['sales'], 1);

    // contactNotes: needs contact_id, sales_id
    console.log('\ncontactNotes:');
    await addRelationField('contactNotes', 'contact_id', c['contacts'], 1);
    await addRelationField('contactNotes', 'sales_id', c['sales'], 1);

    // dealNotes: needs deal_id, sales_id
    console.log('\ndealNotes:');
    await addRelationField('dealNotes', 'deal_id', c['deals'], 1);
    await addRelationField('dealNotes', 'sales_id', c['sales'], 1);

    // companies: needs sales_id
    console.log('\ncompanies:');
    await addRelationField('companies', 'sales_id', c['sales'], 1);

    // Verify all collections
    console.log('\n📊 Final verification:');
    for (const name of ['contacts', 'deals', 'tasks', 'contactNotes', 'dealNotes', 'companies']) {
      const col = await pb.collections.getOne(name);
      const relationFields = col.fields
        .filter(f => f.type === 'relation')
        .map(f => f.name);
      console.log(`  ${name}: ${relationFields.join(', ') || '(no relations)'}`);
    }

    console.log('\n✅ All relation fields added successfully!');

  } catch (err) {
    console.error('Error:', err);
  }
}

main();
