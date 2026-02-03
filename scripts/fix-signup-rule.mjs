import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb-custly.kainuotech.com');

async function main() {
  await pb.collection('_superusers').authWithPassword('kainuotech@gmail.com', 'Gaodan123.');
  console.log('✅ Authenticated\n');

  const sales = await pb.collections.getOne('sales');
  console.log('Current rules:');
  console.log('  createRule:', JSON.stringify(sales.createRule));
  console.log('  listRule:', JSON.stringify(sales.listRule));
  console.log('  viewRule:', JSON.stringify(sales.viewRule));

  // For Auth collections in PocketBase:
  // - null or undefined = admin only
  // - "" (empty string) = public access (anyone can)
  // - "@request.auth.id != ''" = authenticated users only
  
  // We want to allow public registration, so createRule should be "" (empty string, not null)
  const response = await fetch(`https://pb-custly.kainuotech.com/api/collections/${sales.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': pb.authStore.token
    },
    body: JSON.stringify({
      // Allow anyone to register (public signup)
      createRule: "",
      // Keep existing rules for list/view
      listRule: sales.listRule,
      viewRule: sales.viewRule,
    })
  });

  if (response.ok) {
    console.log('\n✅ Updated createRule to allow public registration');
    
    // Verify
    const updated = await pb.collections.getOne('sales');
    console.log('\nNew rules:');
    console.log('  createRule:', JSON.stringify(updated.createRule));
  } else {
    const error = await response.text();
    console.log('❌ Failed:', error);
  }

  // Test signup
  console.log('\n📋 Testing signup...');
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const result = await pb.collection('sales').create({
      email: testEmail,
      password: 'testpassword123',
      passwordConfirm: 'testpassword123',
      first_name: 'Test',
      last_name: 'User',
    });
    console.log('✅ Signup test passed! Created user:', result.id);
    
    // Clean up - delete test user
    await pb.collection('sales').delete(result.id);
    console.log('✅ Cleaned up test user');
  } catch (e) {
    console.log('❌ Signup test failed:', e.message);
  }
}

main();
