import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb-custly.kainuotech.com');

async function main() {
  await pb.collection('_superusers').authWithPassword('kainuotech@gmail.com', 'Gaodan123.');
  console.log('✅ Authenticated');

  const sales = await pb.collections.getOne('sales');
  console.log('Current sales fields:', sales.fields.map(f => f.name).join(', '));

  // Check if disabled exists
  const hasDisabled = sales.fields.some(f => f.name === 'disabled');
  if (hasDisabled) {
    console.log('disabled already exists');
    return;
  }

  // Add disabled field
  const newField = {
    name: 'disabled',
    type: 'bool',
    required: false,
    system: false,
    hidden: false
  };

  const response = await fetch('https://pb-custly.kainuotech.com/api/collections/' + sales.id, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': pb.authStore.token
    },
    body: JSON.stringify({
      fields: [...sales.fields, newField]
    })
  });

  if (response.ok) {
    console.log('✅ Added disabled field to sales');
    // Test the filter
    const test = await pb.collection('sales').getList(1, 1, { filter: 'disabled!=true' });
    console.log('✅ Filter test passed');
  } else {
    const error = await response.text();
    console.log('❌ Failed:', error);
  }
}

main();
