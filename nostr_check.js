async function checkNostr() {
  const pubkey = "701ed64be4ced643806e57d187ed2b88f3a3a41c6d70102660d5c074e5087e59"; // Hex for that npub
  const url = "https://api.nostr.band/v0/trends/profiles"; // Just to see if API responds
  try {
    const response = await fetch("https://api.nostr.band/v0/stats/profile/npub12rv5lskctqxxs2c8rf2zlzc7xx3qpvzs3w4etgemauy9thegr43sf485vg");
    const data = await response.json();
    console.log(JSON.stringify(data));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
checkNostr();
