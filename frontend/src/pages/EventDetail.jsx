import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventById } from "../services/api";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    getEventById(id).then(setEvent);
  }, [id]);

  if (!event) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>{event.name}</h2>
      <p>Date: {event.date}</p>
      <button>Buy Ticket</button>
    </div>
  );
}
