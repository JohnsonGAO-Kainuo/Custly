import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb-custly.kainuotech.com');

async function main() {
  await pb.collection('_superusers').authWithPassword('kainuotech@gmail.com', 'Gaodan123.');
  console.log('✅ Authenticated\n');

  const sales = await pb.collections.getOne('sales');
  console.log('Current fields:', sales.fields.map(f => f.name).join(', '));

  // Sales (Auth collection) needs these fields for the CRM
  const newFields = [
    { name: 'first_name', type: 'text', required: false },
    { name: 'last_name', type: 'text', required: false },
    { name: 'avatar', type: 'file', maxSelect: 1, maxSize: 5242880 },
    { name: 'administrator', type: 'bool', required: false },
    { name: 'created_at', type: 'autodate', onCreate: true, onUpdate: false },
    { name: 'updated_at', type: 'autodate', onCreate: true, onUpdate: true },
  ];

  // Filter out existing fields
  const existingNames = sales.fields.map(f => f.name);
  const fieldsToAdd = newFields.filter(f => !existingNames.includes(f.name));

  if (fieldsToAdd.length === 0) {
    console.log('All fields already exist');
    return;
  }

  console.log('Adding fields:', fieldsToAdd.map(f => f.name).join(', '));

  const response = await fetch(`https://pb-custly.kainuotech.com/api/collections/${sales.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': pb.authStore.token
    },
    body: JSON.stringify({
      fields: [...sales.fields, ...fieldsToAdd]
    })
  });

  if (response.ok) {
    console.log('✅ Fields added successfully');
    
    // Test the sort
    const test = await pb.collection('sales').getList(1, 1, { sort: 'last_name', filter: 'disabled != true' });
    console.log('✅ Sort/filter test passed');
  } else {
    const error = await response.text();
    console.log('❌ Failed:', error);
  }
}

main();
