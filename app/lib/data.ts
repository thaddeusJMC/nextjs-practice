import { createClient } from '@supabase/supabase-js';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  User,
  Revenue,
  Invoice,
} from './definitions';
import { formatCurrency } from './utils';
import { UUID } from 'crypto';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).

  noStore()

  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));


    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase =  createClient(supabaseUrl, supabaseKey)
    const data = await supabase.from("revenue").select()

    // console.log('Data fetch completed after 3 seconds.');

    return data.data!;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {

  noStore()

  try {
    type InvoiceCustomerData = {
      id: string,
      amount: number,
      status: string,
      customer_id: UUID,
      customers: {
        name: string,
        email: string,
        image_url: string
      }
    }

    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase =  createClient(supabaseUrl, supabaseKey)

    const latestInvoices= await supabase.from("invoices").select(
      `id, amount, status, customer_id, customers( name, email, image_url )`
    ).order("date", {ascending: false}).limit(5).returns<InvoiceCustomerData[]>()

    const latestInvoicesFormatted: Array<LatestInvoice>= latestInvoices.data!.map((invoice) => {return {
      id: invoice.id,
      name: invoice.customers["name"],
      email: invoice.customers["email"],
      image_url: invoice.customers["image_url"],
      amount: formatCurrency(invoice.amount)
    }})
    return latestInvoicesFormatted
    }
    catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {

  noStore()

  try {

    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_KEY!
    const supabase =  createClient(supabaseUrl, supabaseKey)
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = supabase.from("invoices").select('*', {count: 'exact'});
    const customerCountPromise = supabase.from("customers").select('*', {count: 'exact'});
    const invoicePaidPromise = supabase.from("invoices").select('*').eq("status","paid")
    const invoicePendingPromise = supabase.from("invoices").select('*').eq("status","pending")

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoicePaidPromise,
      invoicePendingPromise
    ]);

    const numberOfInvoices = Number(data[0].count);
    const numberOfCustomers = Number(data[1].count);
    const totalPaidInvoices = formatCurrency(data[2].data!
      .map((invoice: Invoice) => invoice.amount)
      .reduce((a,b) => {return a+b}));
    const totalPendingInvoices = formatCurrency(data[3].data!
      .map((invoice: Invoice) => invoice.amount)
      .reduce((a,b) => {return a+b}));

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

// const ITEMS_PER_PAGE = 6;
// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {
//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;

//   try {
//     const invoices = await sql<InvoicesTable>`
//       SELECT
//         invoices.id,
//         invoices.amount,
//         invoices.date,
//         invoices.status,
//         customers.name,
//         customers.email,
//         customers.image_url
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       WHERE
//         customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`} OR
//         invoices.amount::text ILIKE ${`%${query}%`} OR
//         invoices.date::text ILIKE ${`%${query}%`} OR
//         invoices.status ILIKE ${`%${query}%`}
//       ORDER BY invoices.date DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;

//     return invoices.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoices.');
//   }
// }

// export async function fetchInvoicesPages(query: string) {
//   try {
//     const count = await sql`SELECT COUNT(*)
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE
//       customers.name ILIKE ${`%${query}%`} OR
//       customers.email ILIKE ${`%${query}%`} OR
//       invoices.amount::text ILIKE ${`%${query}%`} OR
//       invoices.date::text ILIKE ${`%${query}%`} OR
//       invoices.status ILIKE ${`%${query}%`}
//   `;

//     const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
//     return totalPages;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch total number of invoices.');
//   }
// }

// export async function fetchInvoiceById(id: string) {
//   try {
//     const data = await sql<InvoiceForm>`
//       SELECT
//         invoices.id,
//         invoices.customer_id,
//         invoices.amount,
//         invoices.status
//       FROM invoices
//       WHERE invoices.id = ${id};
//     `;

//     const invoice = data.rows.map((invoice) => ({
//       ...invoice,
//       // Convert amount from cents to dollars
//       amount: invoice.amount / 100,
//     }));

//     return invoice[0];
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoice.');
//   }
// }

// export async function fetchCustomers() {
//   try {
//     const data = await sql<CustomerField>`
//       SELECT
//         id,
//         name
//       FROM customers
//       ORDER BY name ASC
//     `;

//     const customers = data.rows;
//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch all customers.');
//   }
// }

// export async function fetchFilteredCustomers(query: string) {
//   try {
//     const data = await sql<CustomersTableType>`
// 		SELECT
// 		  customers.id,
// 		  customers.name,
// 		  customers.email,
// 		  customers.image_url,
// 		  COUNT(invoices.id) AS total_invoices,
// 		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
// 		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
// 		FROM customers
// 		LEFT JOIN invoices ON customers.id = invoices.customer_id
// 		WHERE
// 		  customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`}
// 		GROUP BY customers.id, customers.name, customers.email, customers.image_url
// 		ORDER BY customers.name ASC
// 	  `;

//     const customers = data.rows.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));

//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch customer table.');
//   }
// }

// export async function getUser(email: string) {
//   try {
//     const user = await sql`SELECT * FROM users WHERE email=${email}`;
//     return user.rows[0] as User;
//   } catch (error) {
//     console.error('Failed to fetch user:', error);
//     throw new Error('Failed to fetch user.');
//   }
// }
