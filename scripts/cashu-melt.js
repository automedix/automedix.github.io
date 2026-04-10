#!/usr/bin/env node
/**
 * cashu-melt.js — Cashu → Lightning Melt Script
 * Liest Proofs aus der lokalen Cashu-DB, holt ein Melt-Quote von der Mint,
 * erstellt eine Lightning Invoice via NWC CLI und löst alles ein.
 *
 * Usage:
 *   node cashu-melt.js [--dry-run] [--amount <sats>]
 *
 * --dry-run   Nur Balance anzeigen, nichts einlösen
 * --amount    Ziel-Betrag in Sats (default: alles was geht)
 */

const https = require('https');
const { execSync } = require('child_process');
const Database = require('/root/.openclaw/workspace/scripts/node_modules/better-sqlite3');

const DB_PATH = '/root/.cashu/wallet/wallet.sqlite3';
const MINT_HOST = 'mint.macadamia.cash';

const dryRun = process.argv.includes('--dry-run');
const amountArg = process.argv.indexOf('--amount');
const targetAmount = amountArg > -1 ? parseInt(process.argv[amountArg + 1]) : null;

function post(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => {
        if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${out}`));
        else resolve(JSON.parse(out));
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function makeInvoice(amount, description) {
  const result = execSync(
    `npx @getalby/cli make-invoice --amount ${amount} --description "${description}" 2>/dev/null`,
    { encoding: 'utf8', timeout: 20000 }
  );
  return JSON.parse(result);
}

function getBalance() {
  const result = execSync('npx @getalby/cli get-balance 2>/dev/null', { encoding: 'utf8', timeout: 15000 });
  return JSON.parse(result).amount_in_sats;
}

async function main() {
  const db = new Database(DB_PATH, { readonly: true });
  // NUR macadamia.cash Proofs verwenden - Filter nach Keyset-ID
  // macadamia.cash Keyset: 00d4cde34fada3fd
  // 8333.space Keyset (defekt): 002fdba048671056
  const proofs = db.prepare(`
    SELECT amount, secret, id, C 
    FROM proofs 
    WHERE (reserved = 0 OR reserved IS NULL) 
    AND id = '00d4cde34fada3fd'
  `).all();

  const total = proofs.reduce((s, p) => s + p.amount, 0);
  console.log(`\n📦 Cashu Wallet: ${proofs.length} Proofs = ${total} Sats`);
  console.log(`   Mint: https://${MINT_HOST}`);

  if (proofs.length === 0) {
    console.log('Keine Proofs vorhanden.');
    return;
  }

  if (dryRun) {
    console.log('\n[DRY RUN] Kein Melt durchgeführt.');
    return;
  }

  // Sort descending so we pick largest proofs first
  proofs.sort((a, b) => b.amount - a.amount);

  // Strategy: melt in chunks that fit routing (avoid tiny amounts that fail routing)
  // Minimum useful melt: 100 sats (below that routing often fails on macadamia)
  const MIN_MELT = 50;

  // Determine how much to melt
  const meltTarget = targetAmount || total;

  // Select proofs greedily
  let selected = [];
  let selectedTotal = 0;
  for (const p of proofs) {
    if (selectedTotal >= meltTarget) break;
    selected.push(p);
    selectedTotal += p.amount;
  }

  if (selectedTotal < MIN_MELT) {
    console.log(`\n⚠️  Nur ${selectedTotal} Sats verfügbar — zu wenig für zuverlässiges Routing (min ${MIN_MELT}).`);
    console.log(`   Token zum manuellen Import:\n`);
    printToken(selected, selectedTotal);
    return;
  }

  console.log(`\n🔁 Melt: ${selected.length} Proofs = ${selectedTotal} Sats → Lightning`);

  // Get a melt quote to know exact fee_reserve
  // Create a slightly conservative invoice (leave room for fees)
  const feeEstimate = Math.max(3, Math.ceil(selectedTotal * 0.01)); // ~1% or min 3
  const invoiceAmount = selectedTotal - feeEstimate;

  console.log(`💡 Invoice: ${invoiceAmount} Sats (${feeEstimate} Sats Puffer für Fees)`);

  const nwcBalanceBefore = getBalance();
  console.log(`💼 NWC Balance vorher: ${nwcBalanceBefore} Sats`);

  // Create invoice
  const inv = makeInvoice(invoiceAmount, 'Cashu melt');
  console.log(`📄 Invoice erstellt: ${invoiceAmount} Sats (hash: ${inv.payment_hash.substring(0, 16)}...)`);

  // Get melt quote
  const quote = await post(MINT_HOST, '/v1/melt/quote/bolt11', {
    unit: 'sat', request: inv.invoice
  });
  const needed = quote.amount + quote.fee_reserve;
  console.log(`📊 Mint Quote: ${quote.amount} + ${quote.fee_reserve} Fee = ${needed} benötigt, ${selectedTotal} verfügbar`);

  if (needed > selectedTotal) {
    // Add one more proof if available
    const remaining = proofs.filter(p => !selected.includes(p));
    if (remaining.length > 0) {
      const extra = remaining[0];
      selected.push(extra);
      selectedTotal += extra.amount;
      console.log(`➕ Extra Proof hinzugefügt (+${extra.amount}): jetzt ${selectedTotal} Sats`);
    }
    if (needed > selectedTotal) {
      throw new Error(`Nicht genug: brauche ${needed}, habe ${selectedTotal}`);
    }
  }

  // Execute melt
  console.log(`\n⚡ Sende melt request an Mint...`);
  const meltResult = await post(MINT_HOST, '/v1/melt/bolt11', {
    quote: quote.quote,
    inputs: selected.map(p => ({ amount: p.amount, secret: p.secret, id: p.id, C: p.C }))
  });

  if (meltResult.state === 'PAID' || meltResult.paid === true) {
    const nwcBalanceAfter = getBalance();
    const received = nwcBalanceAfter - nwcBalanceBefore;
    const fees = selectedTotal - received;
    console.log(`\n✅ ERFOLG!`);
    console.log(`   Eingelöst:  ${selectedTotal} Sats`);
    console.log(`   Angekommen: ${received} Sats`);
    console.log(`   Fees:       ${fees} Sats`);
    console.log(`   NWC Balance: ${nwcBalanceAfter} Sats`);

    // Check if there are remaining proofs to report
    const leftover = proofs.filter(p => !selected.includes(p));
    const leftoverTotal = leftover.reduce((s, p) => s + p.amount, 0);
    if (leftover.length > 0) {
      if (leftoverTotal >= MIN_MELT) {
        console.log(`\n📦 Verbleibend: ${leftover.length} Proofs = ${leftoverTotal} Sats (separat einlösen)`);
      } else {
        console.log(`\n📦 Verbleibend: ${leftoverTotal} Sats (zu klein für Lightning-Routing)`);
        console.log(`   Cashu Token zum Import:\n`);
        printToken(leftover, leftoverTotal);
      }
    }
  } else {
    console.error('❌ Melt nicht bestätigt:', JSON.stringify(meltResult));
  }
}

function printToken(proofs, total) {
  const tokenData = {
    token: [{
      mint: `https://${MINT_HOST}`,
      proofs: proofs.map(p => ({ amount: p.amount, secret: p.secret, id: p.id, C: p.C }))
    }],
    unit: 'sat',
    memo: `${total} Sats — manuell importieren`
  };
  const token = 'cashuA' + Buffer.from(JSON.stringify(tokenData)).toString('base64url');
  console.log(token);
}

main().catch(e => {
  console.error('❌ Fehler:', e.message);
  process.exit(1);
});
