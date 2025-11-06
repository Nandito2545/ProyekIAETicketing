import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <div className="event-card">
      <h3>{event.name}</h3>
      <p>Date: {event.date}</p>
      <Link to={`/event/${event.id}`}>View Details</Link>
    </div>
  );
}
