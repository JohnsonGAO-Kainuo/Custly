const url = 'https://pb-custly.kainuotech.com';
const email = 'kainuotech@gmail.com';
const password = 'Gaodan123.';

async function authAdmin() {
  const response = await fetch(`${url}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password })
  });
  const data = await response.json();
  return data.token;
}

async function getCollection(token, name) {
  const response = await fetch(`${url}/api/collections/${name}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}

async function updateCollection(token, id, updates) {
  // First get existing collection to preserve system fields
  const getRes = await fetch(`${url}/api/collections/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const existing = await getRes.json();
  
  // Merge existing system fields with new fields
  const systemFields = (existing.fields || []).filter(f => f.system);
  const newFields = [...systemFields, ...(updates.fields || [])];
  
  const response = await fetch(`${url}/api/collections/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ...updates, fields: newFields })
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update: ${text}`);
  }
  return response.json();
}

async function getSalesId(token) {
  const sales = await getCollection(token, 'sales');
  return sales.id;
}

const authRule = '@request.auth.id != ""';

async function main() {
  console.log('Authenticating...');
  const token = await authAdmin();
  console.log('Authenticated!');
  
  const salesId = await getSalesId(token);
  console.log('Sales collection ID:', salesId);

  // Companies
  console.log('\nUpdating companies...');
  const companies = await getCollection(token, 'companies');
  await updateCollection(token, companies.id, {
    fields: [
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
      { name: 'sales_id', type: 'relation', required: false, options: { collectionId: salesId, maxSelect: 1, cascadeDelete: false } },
    ],
    listRule: authRule,
    viewRule: authRule,
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
  });
  console.log('companies updated!');

  // Get tags collection ID
  const tags = await getCollection(token, 'tags');
  await updateCollection(token, tags.id, {
    fields: [
      { name: 'name', type: 'text', required: true, options: { max: 120 } },
      { name: 'color', type: 'text', required: true, options: { max: 20 } },
    ],
    listRule: authRule,
    viewRule: authRule,
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
  });
  console.log('tags updated!');

  // Contacts
  console.log('\nUpdating contacts...');
  const contacts = await getCollection(token, 'contacts');
  await updateCollection(token, contacts.id, {
    fields: [
      { name: 'first_name', type: 'text', required: false },
      { name: 'last_name', type: 'text', required: false },
      { name: 'gender', type: 'text', required: false },
      { name: 'title', type: 'text', required: false },
      { name: 'email_jsonb', type: 'json', required: false },
      { name: 'phone_jsonb', type: 'json', required: false },
      { name: 'background', type: 'text', required: false },
      { name: 'avatar', type: 'file', required: false, options: { maxSelect: 1, maxSize: 5000000 } },
      { name: 'first_seen', type: 'date', required: false },
      { name: 'last_seen', type: 'date', required: false },
      { name: 'has_newsletter', type: 'bool', required: false },
      { name: 'status', type: 'text', required: false },
      { name: 'linkedin_url', type: 'url', required: false },
      { name: 'company_id', type: 'relation', required: false, options: { collectionId: companies.id, maxSelect: 1 } },
      { name: 'sales_id', type: 'relation', required: false, options: { collectionId: salesId, maxSelect: 1 } },
      { name: 'tags', type: 'relation', required: false, options: { collectionId: tags.id, maxSelect: 999 } },
    ],
    listRule: authRule,
    viewRule: authRule,
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
  });
  console.log('contacts updated!');

  // Deals
  console.log('\nUpdating deals...');
  const deals = await getCollection(token, 'deals');
  await updateCollection(token, deals.id, {
    fields: [
      { name: 'name', type: 'text', required: true, options: { max: 200 } },
      { name: 'category', type: 'text', required: false },
      { name: 'stage', type: 'text', required: true },
      { name: 'description', type: 'text', required: false },
      { name: 'amount', type: 'number', required: false },
      { name: 'expected_closing_date', type: 'date', required: false },
      { name: 'archived_at', type: 'date', required: false },
      { name: 'index', type: 'number', required: false },
      { name: 'company_id', type: 'relation', required: false, options: { collectionId: companies.id, maxSelect: 1 } },
      { name: 'contact_ids', type: 'relation', required: false, options: { collectionId: contacts.id, maxSelect: 999 } },
      { name: 'sales_id', type: 'relation', required: false, options: { collectionId: salesId, maxSelect: 1 } },
    ],
    listRule: authRule,
    viewRule: authRule,
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
  });
  console.log('deals updated!');

  // Tasks
  console.log('\nUpdating tasks...');
  const tasks = await getCollection(token, 'tasks');
  await updateCollection(token, tasks.id, {
    fields: [
      { name: 'type', type: 'text', required: false },
      { name: 'text', type: 'text', required: false },
      { name: 'due_date', type: 'date', required: true },
      { name: 'done_date', type: 'date', required: false },
      { name: 'contact_id', type: 'relation', required: true, options: { collectionId: contacts.id, maxSelect: 1 } },
      { name: 'sales_id', type: 'relation', required: false, options: { collectionId: salesId, maxSelect: 1 } },
    ],
    listRule: authRule,
    viewRule: authRule,
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
  });
  console.log('tasks updated!');

  // Contact Notes
  console.log('\nUpdating contactNotes...');
  const contactNotes = await getCollection(token, 'contactNotes');
  await updateCollection(token, contactNotes.id, {
    fields: [
      { name: 'text', type: 'text', required: true },
      { name: 'date', type: 'date', required: true },
      { name: 'status', type: 'text', required: false },
      { name: 'attachments', type: 'file', required: false, options: { maxSelect: 10, maxSize: 10000000 } },
      { name: 'contact_id', type: 'relation', required: true, options: { collectionId: contacts.id, maxSelect: 1 } },
      { name: 'sales_id', type: 'relation', required: false, options: { collectionId: salesId, maxSelect: 1 } },
    ],
    listRule: authRule,
    viewRule: authRule,
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
  });
  console.log('contactNotes updated!');

  // Deal Notes
  console.log('\nUpdating dealNotes...');
  const dealNotes = await getCollection(token, 'dealNotes');
  await updateCollection(token, dealNotes.id, {
    fields: [
      { name: 'text', type: 'text', required: true },
      { name: 'date', type: 'date', required: true },
      { name: 'attachments', type: 'file', required: false, options: { maxSelect: 10, maxSize: 10000000 } },
      { name: 'deal_id', type: 'relation', required: true, options: { collectionId: deals.id, maxSelect: 1 } },
      { name: 'sales_id', type: 'relation', required: false, options: { collectionId: salesId, maxSelect: 1 } },
    ],
    listRule: authRule,
    viewRule: authRule,
    createRule: authRule,
    updateRule: authRule,
    deleteRule: authRule,
  });
  console.log('dealNotes updated!');

  console.log('\n✅ All collections updated successfully!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
