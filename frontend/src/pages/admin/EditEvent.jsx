import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// ✅ 1. Import 'getEventById', 'updateEvent', DAN 'uploadImage'
import { getEventById, updateEvent, uploadImage } from "../../services/eventService";
import { Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import "./EventManagement.css"; // Pakai ulang CSS yang ada
import { getImageUrl } from "../../utils/imageUtils"; // Import helper gambar

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    capacity: 0,
    price: 0,
    category: "music",
    imageUrl: "", // Akan menyimpan URL gambar yang *sudah ada*
  });
  
  // ✅ 2. Buat state terpisah untuk file gambar BARU
  const [imageFile, setImageFile] = useState(null); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await getEventById(id);
        if (res.success && res.event) {
          const eventDate = res.event.date ? new Date(res.event.date).toISOString().split('T')[0] : "";
          setFormData({
            ...res.event,
            date: eventDate,
          });
        } else {
          setError(res.message || "Event not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load event data.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

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

    let finalImageUrl = formData.imageUrl; // Mulai dengan gambar yang sudah ada

    try {
      // ✅ 4. PROSES UPLOAD GAMBAR BARU (JIKA ADA)
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        if (uploadRes.success) {
          finalImageUrl = uploadRes.filePath; // Timpa dengan path gambar baru
        } else {
          throw new Error(uploadRes.message || 'Image upload failed');
        }
      }

      // ✅ 5. UPDATE EVENT
      const eventData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price),
        imageUrl: finalImageUrl, // Kirim path gambar (baru atau lama)
      };
      
      const res = await updateEvent(id, eventData);

      if (res.success) {
        alert("Event updated successfully!");
        navigate("/admin/event-management");
      } else {
        setError(res.message || "Failed to update event");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !formData.title) {
     return <div className="admin-table-wrapper"><Spinner animation="border" /> Loading Event Data...</div>;
  }

  return (
    <div>
      <h1>Edit Event</h1>
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
                  value={formData.title} onChange={handleChange} required
                />
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Event Description</Form.Label>
                <Form.Control
                  as="textarea" rows={3} name="description"
                  value={formData.description} onChange={handleChange} required
                />
              </Form.Group>

              {/* Tampilkan gambar saat ini */}
              {formData.imageUrl && (
                <div className="mb-2">
                  <Form.Label>Current Image</Form.Label>
                  <img 
                    src={getImageUrl(formData.imageUrl)} // Gunakan helper
                    alt="Current Event" 
                    style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} 
                  />
                </div>
              )}

              {/* ✅ 6. UBAH INPUT MENJADI 'file' */}
              <Form.Group className="mb-3" controlId="imageFile">
                <Form.Label>Upload New Image (Optional)</Form.Label>
                <Form.Control
                  type="file"
                  name="imageFile"
                  onChange={handleFileChange}
                />
                <Form.Text>Pilih file baru untuk mengganti gambar saat ini.</Form.Text>
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
            {loading ? <Spinner as="span" animation="border" size="sm" /> : "Update Event"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default EditEvent;