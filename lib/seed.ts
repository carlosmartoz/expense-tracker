import type { Transaction, TransactionType } from "./types";

let counter = 0;
function id(): string {
  counter += 1;
  return `seed-${Date.now().toString(36)}-${counter}`;
}

function tx(
  type: TransactionType,
  amount: number,
  categoryId: string,
  description: string,
  date: string
): Transaction {
  return { id: id(), type, amount, categoryId, description, date };
}

/**
 * Builds a few months of realistic demo data ending at the current month,
 * with an intentional spike in delivery/subscriptions in the latest month so
 * the charts and comparisons have something interesting to show.
 */
export function buildSeedData(reference = new Date()): Transaction[] {
  const out: Transaction[] = [];
  const y = reference.getFullYear();
  const m = reference.getMonth(); // 0-based

  // Generate the last 5 months (oldest -> current)
  for (let back = 4; back >= 0; back--) {
    const d = new Date(y, m - back, 1);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-based
    const monthStr = String(month + 1).padStart(2, "0");
    const day = (n: number) => `${year}-${monthStr}-${String(n).padStart(2, "0")}`;
    const isCurrent = back === 0;
    const isPrev = back === 1;

    // Salary income
    out.push(tx("income", 950000, "Salary", "Salary", day(3)));
    if (isCurrent || isPrev) {
      out.push(tx("income", 120000, "Freelance", "Freelance", day(18)));
    }

    // Food + delivery (spike in current month)
    const deliveryBase = isCurrent ? 9 : 6;
    for (let i = 0; i < deliveryBase; i++) {
      out.push(
        tx(
          "expense",
          6500 + (i % 3) * 1500,
          "Food",
          i % 2 ? "Delivery" : "Supermarket",
          day(2 + i * 3)
        )
      );
    }

    // Transport (Uber)
    const uberTrips = isCurrent ? 12 : 9;
    for (let i = 0; i < uberTrips; i++) {
      out.push(tx("expense", 2800 + (i % 4) * 600, "Transport", "Uber", day(1 + i * 2)));
    }

    // Entertainment: subscriptions and games (grows in the last month)
    out.push(tx("expense", 4990, "Entertainment", "Netflix", day(5)));
    out.push(tx("expense", 3490, "Entertainment", "Spotify", day(7)));
    if (isCurrent) {
      out.push(tx("expense", 7990, "Entertainment", "HBO Max", day(8)));
      out.push(tx("expense", 5990, "Entertainment", "Cinema", day(9)));
    } else if (isPrev) {
      out.push(tx("expense", 7990, "Entertainment", "HBO Max", day(8)));
    }
    if (back % 2 === 0) {
      out.push(tx("expense", 12000, "Entertainment", "Steam", day(14)));
    }

    // Home and the bills that come with it
    out.push(tx("expense", 38000, "Home", "Rent / Fees", day(10)));
    out.push(tx("expense", 9500, "Services", "Power and gas", day(12)));
    out.push(tx("expense", 6200, "Services", "Internet", day(13)));

    // Health and shopping, so every default category shows up somewhere
    if (back % 2 === 1) {
      out.push(tx("expense", 15000, "Health", "Dentist", day(20)));
    }
    out.push(tx("expense", 22000, "Shopping", isCurrent ? "Sneakers" : "Clothes", day(16)));
    if (isCurrent) {
      out.push(tx("expense", 3800, "Other", "Misc", day(22)));
    }
  }

  return out;
}
