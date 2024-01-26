const supa = require('@supabase/supabase-js')
const createClient = supa.createClient
const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');


const supabaseUrl = 'https://alsudnyhudywyzspowoo.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function seedUsers(client) {
  try {
    users.map(async (user) => {
      console.log(user)
      console.log(await client.from("users").insert(user))
    })
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedInvoices(client) {
  try {
    invoices.map(async (invoice) => {
      console.log(invoice)
      console.log(await client.from("invoices").insert(invoice))
    })
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedCustomers(client) {
  try {
    customers.map(async (customer) => {
      console.log(customer)
      console.log(await client.from("customers").insert(customer))
    })
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedRevenue(client) {
  try {
    revenue.map(async (rev) => {
      console.log(rev)
      console.log(await client.from("revenue").insert(rev))
    })
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

async function main() {
  // supabase doesn't allow table creation through the api, 
  // so tables were created and configured from the dashboard
  await seedUsers(supabase);
  await seedCustomers(supabase);
  await seedInvoices(supabase);
  await seedRevenue(supabase);
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});