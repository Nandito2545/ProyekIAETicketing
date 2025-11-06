export default function MyTickets() {
  const tickets = [
    { id: 1, event: "Tech Conference 2025", code: "QR123456" },
  ];

  return (
    <div className="container">
      <h2>My Tickets</h2>
      {tickets.map(t => (
        <div key={t.id}>
          <p><b>{t.event}</b> — Code: {t.code}</p>
        </div>
      ))}
    </div>
  );
}
