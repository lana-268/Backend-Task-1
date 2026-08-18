import fixture from "./fixtures/parallel-users.json" with { type: "json" };

const results = await Promise.all(fixture.users.map(async (user) => {
  const response = await fetch("http://localhost:3011/v1/bookings", {
    method: "POST",
    headers: { "content-type": "application/json", "x-user-id": user.id },
    body: JSON.stringify({ eventId: fixture.eventId }),
  });
  return response.status;
}));

for (const [status, count] of Object.entries(Object.groupBy(results, String))) console.log(`${count?.length} × ${status}`);
