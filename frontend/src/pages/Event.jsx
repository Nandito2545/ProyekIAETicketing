import React from "react";
import "./Event.css";
import { FaSearch } from "react-icons/fa";

const events = [
  {
    id: 1,
    title: "New Year Music Festival",
    date: "Sat, 20 Dec 2020",
    image: "event1.jpg",
  },
  {
    id: 2,
    title: "Black Pink Venom",
    date: "Sat, 23 Nov 2020",
    image: "event2.jpg",
  },
  {
    id: 3,
    title: "Marsatac Festival",
    date: "Sat, 20 Dec 2020",
    image: "event3.jpg",
  },
  {
    id: 4,
    title: "Beyond Wonderland",
    date: "Sat, 20 Dec 2020",
    image: "event4.jpg",
  },
  {
    id: 5,
    title: "Music Day 26",
    date: "Sat, 20 Dec 2020",
    image: "event5.jpg",
  },
  {
    id: 6,
    title: "Blackpink Festival",
    date: "Sat, 20 Dec 2020",
    image: "event6.jpg",
  },
];

const Event = () => {
  return (
    <div className="event-page p-5">
      <div className="event-content container">
        <div className="event-header">
          <h2>Events</h2>
          <div className="search-box">
            <FaSearch />
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        <div className="event-grid">
          {events.map((event) => (
            <div className="event-card" key={event.id}>
              <img src={event.image} alt={event.title} />
              <div className="event-info">
                <h5>{event.title}</h5>
                <p>{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Event;
