// Simple script to update companies collection
const url = 'https://pb-custly.kainuotech.com';
const email = 'kainuotech@gmail.com';
const password = 'Gaodan123.';

async function main() {
  // Auth
  console.log('Authenticating...');
  const authRes = await fetch(`${url}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password })
  });
  const auth = await authRes.json();
  const token = auth.token;
  console.log('Authenticated');

  // Get sales collection ID  
  const salesRes = await fetch(`${url}/api/collections/sales`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const sales = await salesRes.json();
  const salesId = sales.id;
  console.log('Sales ID:', salesId);

  // Get companies collection
  const companiesRes = await fetch(`${url}/api/collections/companies`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const companies = await companiesRes.json();
  console.log('Companies ID:', companies.id);
  console.log('Existing fields count:', companies.fields?.length || 0);

  // Keep system fields (like id)
  const systemFields = (companies.fields || []).filter(f => f.system);
  
  // Define new fields (without sales_id relation for now to test)
  const customFields = [
    { name: 'name', type: 'text', required: true, options: { max: 200 } },
    { name: 'sector', type: 'text', required: false, options: { max: 120 } },
    { name: 'size', type: 'number', required: false },
    { name: 'linkedin_url', type: 'url', required: false },
    { name: 'website', type: 'url', required: false },
    { name: 'phone_number', type: 'text', required: false },
    { name: 'address', type: 'text', required: false },
    { name: 'zipcode', type: 'text', required: false },
    { name: 'city', type: 'text', required: false },
    { name: 'stateAbbr', type: 'text', required: false },
    { name: 'country', type: 'text', required: false },
    { name: 'description', type: 'text', required: false },
    { name: 'revenue', type: 'text', required: false },
    { name: 'tax_identifier', type: 'text', required: false },
    { name: 'context_links', type: 'json', required: false },
    { name: 'logo', type: 'file', required: false, options: { maxSelect: 1, maxSize: 5000000 } },
  ];

  const allFields = [...systemFields, ...customFields];
  console.log('Sending', allFields.length, 'fields');

  // Update without relation first
  const updateRes = await fetch(`${url}/api/collections/${companies.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ 
      fields: allFields,
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    })
  });

  if (updateRes.ok) {
    console.log('✅ Companies updated successfully (without relation)');
    
    // Now add the relation field
    const getAgain = await fetch(`${url}/api/collections/companies`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const updated = await getAgain.json();
    
    const withRelation = [
      ...updated.fields,
      { name: 'sales_id', type: 'relation', required: false, options: { collectionId: salesId, maxSelect: 1 } }
    ];
    
    const addRelationRes = await fetch(`${url}/api/collections/${companies.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ fields: withRelation })
    });
    
    if (addRelationRes.ok) {
      console.log('✅ Added sales_id relation');
    } else {
      console.log('❌ Failed to add relation:', await addRelationRes.text());
    }
  } else {
    console.log('❌ Failed:', await updateRes.text());
  }
}

main().catch(console.error);
