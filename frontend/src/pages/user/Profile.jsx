import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Image, Alert, Spinner } from "react-bootstrap";
import { getUserProfile, updateUserProfile } from "../../services/userService";
import "./Profile.css";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [userData, setUserData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    previewImage: "https://via.placeholder.com/150",
    profile_picture_base64: null // Menyimpan string Base64
  });

  const userId = localStorage.getItem("userId");

  // Fetch Data Awal
  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile(userId);
      if (res.success && res.data) {
        setUserData(prev => ({
          ...prev,
          fullName: res.data.fullName || "",
          username: res.data.username || "",
          email: res.data.email || "",
          // URL Gambar dari server (Port 3000)
          previewImage: res.data.profile_picture 
            ? `http://localhost:3000/uploads/${res.data.profile_picture}` 
            : "https://via.placeholder.com/150",
          profile_picture_base64: null 
        }));
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "danger", text: "Gagal memuat data profil." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // ✅ Convert Gambar ke Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file); // Untuk preview lokal
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({
          ...prev,
          previewImage: previewUrl,
          profile_picture_base64: reader.result // String "data:image/..."
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    // Siapkan Payload JSON
    const payload = {
      fullName: userData.fullName,
      username: userData.username,
      // Kirim password/gambar HANYA jika ada isinya
      ...(userData.password && { password: userData.password }),
      ...(userData.profile_picture_base64 && { profile_picture_base64: userData.profile_picture_base64 })
    };

    try {
      await updateUserProfile(userId, payload);
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      setIsEditing(false);
      setUserData(prev => ({ ...prev, password: "" })); // Reset password field
    } catch (error) {
      console.error(error);
      setMessage({ type: "danger", text: error.message || "Gagal update profil" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="primary"/></div>;

  return (
    <Container className="profile-container my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="profile-card shadow-lg border-0 rounded-4">
            <Card.Body className="p-5">
              
              {/* Foto Profil */}
              <div className="text-center mb-4 position-relative">
                <div className="profile-img-wrapper mx-auto">
                  <Image 
                    src={userData.previewImage} 
                    roundedCircle 
                    className="profile-img border border-4 border-white shadow"
                    onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                  />
                  {isEditing && (
                    <div className="img-overlay">
                      <label htmlFor="upload-photo" className="upload-label">
                        <i className="bi bi-camera-fill"></i> Ganti
                      </label>
                      <input 
                        type="file" id="upload-photo" hidden 
                        onChange={handleImageChange} accept="image/*"
                      />
                    </div>
                  )}
                </div>
                <h3 className="mt-3 fw-bold">{userData.fullName || "User Name"}</h3>
                <p className="text-muted">@{userData.username || "username"}</p>
              </div>

              {message && <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary">Nama Lengkap</Form.Label>
                  <Form.Control 
                    type="text" name="fullName"
                    value={userData.fullName} onChange={handleChange} 
                    disabled={!isEditing} className="form-control-lg bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary">Username</Form.Label>
                  <Form.Control 
                    type="text" name="username"
                    value={userData.username} onChange={handleChange} 
                    disabled={!isEditing} className="form-control-lg bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-secondary">Email</Form.Label>
                  <Form.Control 
                    type="email" value={userData.email} disabled className="form-control-lg bg-light text-muted"
                  />
                </Form.Group>

                {isEditing && (
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-secondary">Password Baru</Form.Label>
                    <Form.Control 
                      type="password" name="password" placeholder="Kosongkan jika tidak berubah"
                      value={userData.password} onChange={handleChange} className="form-control-lg bg-light"
                    />
                  </Form.Group>
                )}

                <div className="d-grid gap-2 mt-4">
                  {!isEditing ? (
                    <Button variant="primary" size="lg" onClick={() => setIsEditing(true)} className="btn-profile fw-bold">Edit Profil</Button>
                  ) : (
                    <div className="d-flex gap-2">
                      <Button variant="secondary" className="flex-fill fw-bold" onClick={() => setIsEditing(false)}>Batal</Button>
                      <Button type="submit" variant="success" className="flex-fill fw-bold" disabled={saving}>
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </div>
                  )}
                </div>
              </Form>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;