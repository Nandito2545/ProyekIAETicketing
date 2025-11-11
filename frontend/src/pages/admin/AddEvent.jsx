import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// ✅ 1. Import 'createEvent' DAN 'uploadImage'
import { createEvent, uploadImage } from "../../services/eventService";
import { Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import "./EventManagement.css";

const AddEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    capacity: 100,
    price: 0,
    category: "music",
  });
  // ✅ 2. Buat state terpisah untuk file gambar
  const [imageFile, setImageFile] = useState(null); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // ✅ 3. Buat handler untuk input file
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let imageUrl = ""; // Default URL gambar kosong

    try {
      // ✅ 4. PROSES UPLOAD GAMBAR (JIKA ADA)
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        if (uploadRes.success) {
          imageUrl = uploadRes.filePath; // Simpan path gambar dari backend
        } else {
          throw new Error(uploadRes.message || 'Image upload failed');
        }
      }

      // ✅ 5. BUAT EVENT (SETELAH GAMBAR DI-UPLOAD)
      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        imageUrl: imageUrl, // Masukkan path gambar yang didapat
      };

      const res = await createEvent(eventData);

      if (res.success) {
        alert("Event created successfully!");
        navigate("/admin/event-management");
      } else {
        setError(res.message || "Failed to create event");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Add New Event</h1>
      <div className="admin-table-wrapper" style={{ padding: '30px' }}>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Kolom Kiri */}
            <Col md={6}>
              <Form.Group className="mb-3" controlId="title">
                <Form.Label>Event Name</Form.Label>
                <Form.Control
                  type="text" name="title"
                  placeholder="eg. Summer Sound Festival"
                  value={formData.title} onChange={handleChange} required
                />
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Event Description</Form.Label>
                <Form.Control
                  as="textarea" rows={3} name="description"
                  placeholder="eg. A festival for music lovers"
                  value={formData.description} onChange={handleChange} required
                />
              </Form.Group>

              {/* ✅ 6. UBAH INPUT MENJADI 'file' */}
              <Form.Group className="mb-3" controlId="imageFile">
                <Form.Label>Event Image</Form.Label>
                <Form.Control
                  type="file"
                  name="imageFile"
                  onChange={handleFileChange}
                />
              </Form.Group>
            </Col>
            
            {/* Kolom Kanan */}
            <Col md={6}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="date">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date" name="date"
                      value={formData.date} onChange={handleChange} required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="time">
                    <Form.Label>Time</Form.Label>
                    <Form.Control
                      type="time" name="time"
                      value={formData.time} onChange={handleChange} required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3" controlId="location">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text" name="location"
                  placeholder="eg. JCC Senayan, Jakarta"
                  value={formData.location} onChange={handleChange} required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="price">
                    <Form.Label>Price (Rp)</Form.Label>
                    <Form.Control
                      type="number" name="price"
                      min="0" value={formData.price} onChange={handleChange} required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="capacity">
                    <Form.Label>Capacity (Wajib)</Form.Label>
                    <Form.Control
                      type="number" name="capacity"
                      min="1" value={formData.capacity} onChange={handleChange} required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="category">
                <Form.Label>Category (Wajib)</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="music">Music</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <hr />
          
          <Button 
            className="btn-add-event" 
            type="submit" 
            disabled={loading}
            style={{backgroundColor: '#C10C99', border: 'none'}}
          >
            {loading ? <Spinner as="span" animation="border" size="sm" /> : "Add Event"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AddEvent;