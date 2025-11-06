export async function getEvents() {
  return [
    { id: 1, name: "Tech Conference 2025", date: "2025-11-10" },
    { id: 2, name: "Music Festival", date: "2025-11-15" },
  ];
}

export async function getEventById(id) {
  const events = await getEvents();
  return events.find(e => e.id === parseInt(id));
}
