import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb-custly.kainuotech.com');

async function main() {
  await pb.collection('_superusers').authWithPassword('kainuotech@gmail.com', 'Gaodan123.');
  console.log('✅ Authenticated\n');

  const templates = await pb.collections.getOne('templates');
  console.log('Current fields:', templates.fields.map(f => f.name).join(', '));

  // Add all needed fields for templates
  const newFields = [
    { name: 'name', type: 'text', required: false },
    { name: 'content', type: 'text', required: false },
    { name: 'type', type: 'text', required: false },
    { name: 'subject', type: 'text', required: false },
    { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
    { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
  ];

  // Filter out existing fields
  const existingNames = templates.fields.map(f => f.name);
  const fieldsToAdd = newFields.filter(f => !existingNames.includes(f.name));

  if (fieldsToAdd.length === 0) {
    console.log('All fields already exist');
    return;
  }

  const response = await fetch(`https://pb-custly.kainuotech.com/api/collections/${templates.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': pb.authStore.token
    },
    body: JSON.stringify({
      fields: [...templates.fields, ...fieldsToAdd]
    })
  });

  if (response.ok) {
    console.log('✅ Added fields:', fieldsToAdd.map(f => f.name).join(', '));
    
    // Test the sort
    const test = await pb.collection('templates').getList(1, 1, { sort: '-updated' });
    console.log('✅ Sort test passed');
  } else {
    const error = await response.text();
    console.log('❌ Failed:', error);
  }
}

main();
