const args = require("yargs").argv

async function main() {
  const { default: fetch } = await import("node-fetch")
  await Promise.all(new Array(50).fill().map((_,i) => fetch(
    args.url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "Body": "Photo of a man getting stung by a swarm of bees.",
        "From": "+13104051131"
      }),
    }
  )))
}

main()