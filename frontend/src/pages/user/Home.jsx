import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Home.css";
import { getAllEvents } from "../../services/eventService";
// ✅ 1. Import helper
import { getImageUrl, handleImageError } from "../../utils/imageUtils"; 

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await getAllEvents({ page: 1, limit: 10 }); 
        if (res.success) {
          setEvents(res.events);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []); 

  const sliderSettings = {
    dots: false,
    infinite: events.length > 3, 
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  const topEvents = events.slice(0, 3);

  return (
    <>
      <section className="hero-section d-flex align-items-center justify-content-center text-center text-white">
        {/* ... (Hero content) ... */}
      </section>

      <Container className="my-5">
        {/* UPCOMING EVENTS */}
        <div className="mt-5">
          {/* ... (Header) ... */}
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <Slider {...sliderSettings}>
              {events.map((event) => (
                <div key={event.id} className="px-3">
                  <div className="upcoming-card position-relative overflow-hidden rounded-4 shadow-sm">
                    {/* ✅ 2. Gunakan helper di sini */}
                    <img
                      src={getImageUrl(event.imageUrl)}
                      alt={event.title}
                      className="upcoming-img img-fluid"
                      onError={handleImageError} 
                    />
                    <div className="upcoming-overlay"></div>
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>

        {/* TOP EVENTS */}
        <div className="top-events mt-5 p-5 rounded-4">
          <h4 className="fw-bold text-white mb-4 text-left">Top Events</h4>
          <Row className="g-4 justify-content-center">
            {topEvents.map((event, index) => (
              <Col md={4} sm={6} xs={12} key={event.id}>
                <div className="top-card position-relative overflow-hidden rounded-4 shadow-sm">
                  {/* ✅ 3. Gunakan helper di sini */}
                  <img
                    src={getImageUrl(event.imageUrl)}
                    className="img-fluid w-100"
                    alt={event.title}
                    onError={handleImageError}
                  />
                  <div className="number-overlay">
                    <span>{index + 1}</span>
                  </div>
                  <div className="buy-overlay d-flex align-items-center justify-content-center">
                    <Link to={`/event/${event.id}`}> 
                      <button className="btn btn-light fw-bold px-4 py-2 buy-btn">
                        Buy Ticket
                      </button>
                    </Link>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* EVENTS */}
        <div className="mt-5">
          <h4 className="fw-bold mb-3">Events</h4>
          {loading ? (
            <p>Loading events...</p>
          ) : (
            <Slider {...sliderSettings}>
              {events.map((event) => (
                <div key={event.id} className="px-2">
                  <div className="event-card position-relative overflow-hidden rounded-4 shadow-sm">
                    {/* ✅ 4. Gunakan helper di sini */}
                    <img
                      src={getImageUrl(event.imageUrl)}
                      alt={event.title}
                      className="img-fluid event-img"
                      onError={handleImageError}
                    />
                    <div className="event-overlay d-flex justify-content-center align-items-center">
                      <Link to={`/event/${event.id}`}>
                        <button className="btn btn-ticket fw-semibold">
                          Buy Ticket
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </Container>
    </>
  );
};

export default Home;