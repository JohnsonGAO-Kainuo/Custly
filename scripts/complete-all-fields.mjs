// Complete all missing fields for deals and other collections
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb-custly.kainuotech.com');

async function addFieldsToCollection(collectionName, newFields) {
  try {
    const collection = await pb.collections.getOne(collectionName);
    
    // Filter out fields that already exist
    const existingFieldNames = collection.fields.map(f => f.name);
    const fieldsToAdd = newFields.filter(f => !existingFieldNames.includes(f.name));
    
    if (fieldsToAdd.length === 0) {
      console.log(`  ${collectionName}: All fields already exist`);
      return;
    }

    const response = await fetch(`https://pb-custly.kainuotech.com/api/collections/${collection.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': pb.authStore.token
      },
      body: JSON.stringify({
        fields: [...collection.fields, ...fieldsToAdd]
      })
    });

    if (response.ok) {
      console.log(`  ${collectionName}: Added ${fieldsToAdd.map(f => f.name).join(', ')}`);
    } else {
      const error = await response.text();
      console.log(`  ${collectionName}: Failed - ${error}`);
    }
  } catch (err) {
    console.log(`  ${collectionName}: Error - ${err.message}`);
  }
}

async function main() {
  try {
    await pb.collection('_superusers').authWithPassword('kainuotech@gmail.com', 'Gaodan123.');
    console.log('✅ Authenticated\n');

    // Get collection IDs
    const collections = await pb.collections.getFullList();
    const c = {};
    for (const col of collections) {
      c[col.name] = col.id;
    }

    console.log('📋 Adding missing fields...\n');

    // deals fields
    const dealsFields = [
      { name: 'name', type: 'text', required: false },
      { name: 'description', type: 'text', required: false },
      { name: 'amount', type: 'number', required: false, min: 0 },
      { name: 'stage', type: 'text', required: false },
      { name: 'type', type: 'text', required: false },
      { name: 'created_at', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated_at', type: 'autodate', onCreate: true, onUpdate: true },
      { name: 'start_at', type: 'date', required: false },
      { name: 'expected_close_date', type: 'date', required: false },
      { name: 'index', type: 'number', required: false },
      { name: 'nb_notes', type: 'number', required: false, min: 0 },
    ];
    await addFieldsToCollection('deals', dealsFields);

    // tasks fields  
    const tasksFields = [
      { name: 'text', type: 'text', required: false },
      { name: 'type', type: 'text', required: false },
      { name: 'done_date', type: 'date', required: false },
      { name: 'due_date', type: 'date', required: false },
    ];
    await addFieldsToCollection('tasks', tasksFields);

    // contactNotes fields
    const contactNotesFields = [
      { name: 'text', type: 'text', required: false },
      { name: 'date', type: 'date', required: false },
      { name: 'status', type: 'text', required: false },
      { name: 'type', type: 'text', required: false },
      { name: 'attachments', type: 'file', maxSelect: 99, maxSize: 10485760 },
    ];
    await addFieldsToCollection('contactNotes', contactNotesFields);

    // dealNotes fields
    const dealNotesFields = [
      { name: 'text', type: 'text', required: false },
      { name: 'date', type: 'date', required: false },
      { name: 'type', type: 'text', required: false },
      { name: 'attachments', type: 'file', maxSelect: 99, maxSize: 10485760 },
    ];
    await addFieldsToCollection('dealNotes', dealNotesFields);

    // Verify all collections
    console.log('\n📊 Final field count:');
    for (const name of ['companies', 'contacts', 'deals', 'tasks', 'contactNotes', 'dealNotes', 'tags', 'sales']) {
      try {
        const col = await pb.collections.getOne(name);
        console.log(`  ${name}: ${col.fields.length} fields`);
      } catch (e) {
        console.log(`  ${name}: not found`);
      }
    }

    console.log('\n✅ All fields completed!');

  } catch (err) {
    console.error('Error:', err);
  }
}

main();
