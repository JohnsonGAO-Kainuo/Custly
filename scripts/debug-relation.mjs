// Debug relation fields
const url = 'https://pb-custly.kainuotech.com';
const email = 'kainuotech@gmail.com';
const password = 'Gaodan123.';

async function main() {
  // Auth
  const authRes = await fetch(`${url}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password })
  });
  const auth = await authRes.json();
  const token = auth.token;
  console.log('Authenticated');

  // Get contacts
  const contactsRes = await fetch(`${url}/api/collections/contacts`, { headers: { Authorization: `Bearer ${token}` } });
  const contacts = await contactsRes.json();
  console.log('contacts fields:', contacts.fields.length);

  // Get companies
  const companiesRes = await fetch(`${url}/api/collections/companies`, { headers: { Authorization: `Bearer ${token}` } });
  const companies = await companiesRes.json();
  console.log('companies.id:', companies.id);

  // Test single relation field
  const newFields = [
    ...contacts.fields,
    { 
      name: 'company_id', 
      type: 'relation', 
      required: false, 
      options: { 
        collectionId: companies.id, 
        maxSelect: 1,
        cascadeDelete: false,
        minSelect: null,
        displayFields: null
      } 
    }
  ];

  console.log('Sending fields:', newFields.length);
  console.log('New relation field:', JSON.stringify(newFields[newFields.length - 1], null, 2));

  const updateRes = await fetch(`${url}/api/collections/${contacts.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fields: newFields })
  });

  if (updateRes.ok) {
    console.log('✅ Success!');
  } else {
    console.log('❌ Failed:', await updateRes.text());
  }
}

main().catch(console.error);
