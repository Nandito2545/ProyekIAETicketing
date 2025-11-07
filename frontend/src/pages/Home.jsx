import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import "./Home.css";

const Home = () => {
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section d-flex align-items-center justify-content-center text-center text-white">
        <div className="hero-overlay"></div>
        <div className="hero-content position-relative">
          <h1 className="fw-bold display-4 mb-3">
            Temukan lagumu, rasakan energinya. <br /> Tiketnya, kami yang urus.
          </h1>
          <Button variant="light" className="px-4 py-2 fw-semibold">
            GET TICKET
          </Button>
        </div>
      </section>

      <Container className="my-5">
      {/* UPCOMING EVENTS */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold">Upcoming Events</h4>
          <Form className="d-flex" style={{ maxWidth: "250px" }}>
            <Form.Control type="search" placeholder="Search events..." />
          </Form>
        </div>

        <Slider
          dots={false}
          infinite={true}
          speed={500}
          slidesToShow={3}
          slidesToScroll={1}
          arrows={true}
          responsive={[
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } },
          ]}
        >
          {[
            { id: 1, img: "event1.jpg", title: "Jakarta Comedy Fest" },
            { id: 2, img: "event2.jpg", title: "Beyond Wonderland" },
            { id: 3, img: "event3.jpg", title: "Marsatac Festival" },
            { id: 4, img: "event4.jpg", title: "We The Fest 2025" },
          ].map((event) => (
            <div key={event.id} className="px-3">
              <div className="upcoming-card position-relative overflow-hidden rounded-4 shadow-sm">
                <img src={event.img} alt={event.title} className="upcoming-img img-fluid" />
                <div className="upcoming-overlay"></div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* TOP EVENTS */}
      <div className="top-events mt-5 p-5 rounded-4">
        <h4 className="fw-bold text-white mb-4 text-left">Top Events</h4>
        <Row className="g-4 justify-content-center">
          {[1, 2, 3].map((num) => (
            <Col md={4} sm={6} xs={12} key={num}>
              <div className="top-card position-relative overflow-hidden rounded-4 shadow-sm">
                <img src={`event${num}.jpg`} className="img-fluid w-100" alt={`Event ${num}`} />

                {/* Overlay angka besar */}
                <div className="number-overlay">
                  <span>{num}</span>
                </div>

                {/* Overlay tombol Buy Ticket */}
                <div className="buy-overlay d-flex align-items-center justify-content-center">
                  <button className="btn btn-light fw-bold px-4 py-2 buy-btn">
                    Buy Ticket
                  </button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>



        {/* EVENTS */}
        <div className="mt-5">
          <h4 className="fw-bold mb-3">Events</h4>

          <Slider
            dots={false}
            infinite={true}
            speed={500}
            slidesToShow={3}
            slidesToScroll={1}
            arrows={true}
            responsive={[
              { breakpoint: 992, settings: { slidesToShow: 2 } },
              { breakpoint: 768, settings: { slidesToShow: 1 } },
            ]}
          >
            {[
              { id: 1, img: "event1.jpg", title: "Jakarta Comedy Fest" },
              { id: 2, img: "event2.jpg", title: "Beyond Wonderland" },
              { id: 3, img: "event3.jpg", title: "Marsatac Festival" },
              { id: 4, img: "event4.jpg", title: "We The Fest 2025" },
            ].map((event) => (
              <div key={event.id} className="px-2">
                <div className="event-card position-relative overflow-hidden rounded-4 shadow-sm">
                  <img src={event.img} alt={event.title} className="img-fluid event-img" />
                  <div className="event-overlay d-flex justify-content-center align-items-center">
                    <button className="btn btn-ticket fw-semibold">Buy Ticket</button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>


      </Container>
    </>
  );
};

export default Home;
