import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pb-custly.kainuotech.com');

// Collections that need sales_id filtering for data isolation
const collectionsWithSalesId = [
  'companies',
  'contacts', 
  'deals',
  'tasks',
  'contactNotes',
  'dealNotes',
];

// Rule that filters by sales_id - user can only see their own data
// OR data where sales_id is null (for admin-created shared data)
const ownerRule = 'sales_id = @request.auth.id || sales_id = null';

async function main() {
  console.log('🔐 Fixing data isolation rules...\n');
  
  // Authenticate as admin
  await pb.collection('_superusers').authWithPassword('kainuotech@gmail.com', 'Gaodan123.');
  console.log('✅ Authenticated as admin\n');

  for (const collectionName of collectionsWithSalesId) {
    console.log(`📦 Processing: ${collectionName}`);
    
    try {
      const collection = await pb.collections.getOne(collectionName);
      
      console.log('  Current rules:');
      console.log(`    listRule: ${collection.listRule}`);
      console.log(`    viewRule: ${collection.viewRule}`);
      
      // Update with proper data isolation
      await pb.collections.update(collectionName, {
        listRule: ownerRule,
        viewRule: ownerRule,
        // Create/Update/Delete still require auth, but we add ownership check
        createRule: '@request.auth.id != ""',
        updateRule: ownerRule,
        deleteRule: ownerRule,
      });
      
      // Verify
      const updated = await pb.collections.getOne(collectionName);
      console.log('  ✅ Updated rules:');
      console.log(`    listRule: ${updated.listRule}`);
      console.log(`    viewRule: ${updated.viewRule}`);
      console.log(`    updateRule: ${updated.updateRule}`);
      console.log(`    deleteRule: ${updated.deleteRule}`);
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  // Handle templates and tags - these are usually shared across users
  const sharedCollections = ['templates', 'tags'];
  const authOnlyRule = '@request.auth.id != ""';
  
  console.log('\n📦 Processing shared collections (templates, tags)...');
  for (const collectionName of sharedCollections) {
    try {
      await pb.collections.update(collectionName, {
        listRule: authOnlyRule,
        viewRule: authOnlyRule,
        createRule: authOnlyRule,
        updateRule: authOnlyRule,
        deleteRule: authOnlyRule,
      });
      console.log(`  ✅ ${collectionName}: auth-only rules applied`);
    } catch (error) {
      console.log(`  ❌ ${collectionName}: ${error.message}`);
    }
  }

  console.log('\n✅ Data isolation rules updated!');
  console.log('\n⚠️  IMPORTANT: Existing data without sales_id will only be visible to admins or when sales_id is null.');
  console.log('    You may need to update existing records to set the correct sales_id.');
}

main().catch(console.error);
