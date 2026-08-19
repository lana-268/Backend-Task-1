import fixture from "./fixtures/parallel-users.json" with { type: "json" };

const results = await Promise.all(fixture.users.map(async (user) => {
  const response = await fetch("http://localhost:3011/v1/bookings", {
    method: "POST",
    headers: { "content-type": "application/json", "x-user-id": user.id },
    body: JSON.stringify({ eventId: fixture.eventId }),
  });
  return response.status;
}));

const groupedResults = Object.groupBy(results, String);
for (const [status, responses] of Object.entries(groupedResults)) {
  console.log(`${responses?.length} x ${status}`);
}

const created = groupedResults["201"]?.length ?? 0;
const conflicts = groupedResults["409"]?.length ?? 0;
const unexpected = results.length - created - conflicts;

if (created !== fixture.capacity || conflicts !== fixture.users.length - fixture.capacity || unexpected !== 0) {
  throw new Error(`Expected ${fixture.capacity} created and ${fixture.users.length - fixture.capacity} conflicts`);
}
