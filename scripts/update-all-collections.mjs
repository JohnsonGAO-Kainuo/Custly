// Update all remaining collections
const url = 'https://pb-custly.kainuotech.com';
const email = 'kainuotech@gmail.com';
const password = 'Gaodan123.';

const authRule = '@request.auth.id != ""';

async function auth() {
  const res = await fetch(`${url}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password })
  });
  const data = await res.json();
  return data.token;
}

async function getCollection(token, name) {
  const res = await fetch(`${url}/api/collections/${name}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

async function updateCollection(token, id, fields, rules = true) {
  const body = { fields };
  if (rules) {
    body.listRule = authRule;
    body.viewRule = authRule;
    body.createRule = authRule;
    body.updateRule = authRule;
    body.deleteRule = authRule;
  }
  const res = await fetch(`${url}/api/collections/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

async function main() {
  console.log('Authenticating...');
  const token = await auth();
  
  // Get collection IDs
  const sales = await getCollection(token, 'sales');
  const companies = await getCollection(token, 'companies');
  const contacts = await getCollection(token, 'contacts');
  const deals = await getCollection(token, 'deals');
  const tags = await getCollection(token, 'tags');
  
  console.log('Collection IDs:');
  console.log('  sales:', sales.id);
  console.log('  companies:', companies.id);
  console.log('  contacts:', contacts.id);
  console.log('  deals:', deals.id);
  console.log('  tags:', tags.id);

  // Update tags
  console.log('\nUpdating tags...');
  const tagsSystem = tags.fields.filter(f => f.system);
  await updateCollection(token, tags.id, [
    ...tagsSystem,
    { name: 'name', type: 'text', required: true, options: { max: 120 } },
    { name: 'color', type: 'text', required: true, options: { max: 20 } },
  ]);
  console.log('✅ tags updated');
  
  // Refresh tags to get correct ID
  const tagsUpdated = await getCollection(token, 'tags');

  // Update contacts (without relations first)
  console.log('\nUpdating contacts (basic fields)...');
  // Filter out system fields AND any existing relation fields that might be broken
  const contactsNonRelation = contacts.fields.filter(f => f.system && f.type !== 'relation');
  await updateCollection(token, contacts.id, [
    ...contactsNonRelation,
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
  ]);
  console.log('✅ contacts basic fields updated');

  // Now add relations to contacts
  console.log('Adding relations to contacts...');
  const contactsBasic = await getCollection(token, 'contacts');
  await updateCollection(token, contactsBasic.id, [
    ...contactsBasic.fields,
    { name: 'company_id', type: 'relation', required: false, options: { collectionId: companies.id, maxSelect: 1 } },
    { name: 'sales_id', type: 'relation', required: false, options: { collectionId: sales.id, maxSelect: 1 } },
    { name: 'tags', type: 'relation', required: false, options: { collectionId: tagsUpdated.id, maxSelect: 999 } },
  ], false);
  console.log('✅ contacts relations added');

  // Update deals
  console.log('\nUpdating deals...');
  // Need to refresh contacts to get updated ID
  const contactsUpdated = await getCollection(token, 'contacts');
  // Filter out broken relation fields
  const dealsNonRelation = deals.fields.filter(f => f.system && f.type !== 'relation');
  await updateCollection(token, deals.id, [
    ...dealsNonRelation,
    { name: 'name', type: 'text', required: true, options: { max: 200 } },
    { name: 'category', type: 'text', required: false },
    { name: 'stage', type: 'text', required: true },
    { name: 'description', type: 'text', required: false },
    { name: 'amount', type: 'number', required: false },
    { name: 'expected_closing_date', type: 'date', required: false },
    { name: 'archived_at', type: 'date', required: false },
    { name: 'index', type: 'number', required: false },
    { name: 'company_id', type: 'relation', required: false, options: { collectionId: companies.id, maxSelect: 1 } },
    { name: 'contact_ids', type: 'relation', required: false, options: { collectionId: contactsUpdated.id, maxSelect: 999 } },
    { name: 'sales_id', type: 'relation', required: false, options: { collectionId: sales.id, maxSelect: 1 } },
  ]);
  console.log('✅ deals updated');

  // Update tasks
  console.log('\nUpdating tasks...');
  const tasks = await getCollection(token, 'tasks');
  const tasksNonRelation = tasks.fields.filter(f => f.system && f.type !== 'relation');
  await updateCollection(token, tasks.id, [
    ...tasksNonRelation,
    { name: 'type', type: 'text', required: false },
    { name: 'text', type: 'text', required: false },
    { name: 'due_date', type: 'date', required: true },
    { name: 'done_date', type: 'date', required: false },
    { name: 'contact_id', type: 'relation', required: true, options: { collectionId: contactsUpdated.id, maxSelect: 1 } },
    { name: 'sales_id', type: 'relation', required: false, options: { collectionId: sales.id, maxSelect: 1 } },
  ]);
  console.log('✅ tasks updated');

  // Update contactNotes
  console.log('\nUpdating contactNotes...');
  const contactNotes = await getCollection(token, 'contactNotes');
  const contactNotesNonRelation = contactNotes.fields.filter(f => f.system && f.type !== 'relation');
  await updateCollection(token, contactNotes.id, [
    ...contactNotesNonRelation,
    { name: 'text', type: 'text', required: true },
    { name: 'date', type: 'date', required: true },
    { name: 'status', type: 'text', required: false },
    { name: 'attachments', type: 'file', required: false, options: { maxSelect: 10, maxSize: 10000000 } },
    { name: 'contact_id', type: 'relation', required: true, options: { collectionId: contactsUpdated.id, maxSelect: 1 } },
    { name: 'sales_id', type: 'relation', required: false, options: { collectionId: sales.id, maxSelect: 1 } },
  ]);
  console.log('✅ contactNotes updated');

  // Update dealNotes
  console.log('\nUpdating dealNotes...');
  const dealNotes = await getCollection(token, 'dealNotes');
  const dealsUpdated = await getCollection(token, 'deals');
  const dealNotesNonRelation = dealNotes.fields.filter(f => f.system && f.type !== 'relation');
  await updateCollection(token, dealNotes.id, [
    ...dealNotesNonRelation,
    { name: 'text', type: 'text', required: true },
    { name: 'date', type: 'date', required: true },
    { name: 'attachments', type: 'file', required: false, options: { maxSelect: 10, maxSize: 10000000 } },
    { name: 'deal_id', type: 'relation', required: true, options: { collectionId: dealsUpdated.id, maxSelect: 1 } },
    { name: 'sales_id', type: 'relation', required: false, options: { collectionId: sales.id, maxSelect: 1 } },
  ]);
  console.log('✅ dealNotes updated');

  // Add sales_id relation to companies
  console.log('\nAdding sales_id to companies...');
  const companiesUpdated = await getCollection(token, 'companies');
  await updateCollection(token, companiesUpdated.id, [
    ...companiesUpdated.fields,
    { name: 'sales_id', type: 'relation', required: false, options: { collectionId: sales.id, maxSelect: 1 } },
  ], false); // don't update rules again
  console.log('✅ companies sales_id added');

  console.log('\n✅ All collections updated successfully!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
