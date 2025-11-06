import { useEffect, useState } from "react";
import { getEvents } from "../services/api";
import EventCard from "../components/EventCard";

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  return (
    <div className="container">
      <h1>Upcoming Events</h1>
      {events.map(event => <EventCard key={event.id} event={event} />)}
    </div>
  );
}
