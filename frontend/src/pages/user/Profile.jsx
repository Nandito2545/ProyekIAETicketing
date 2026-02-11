import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Image, Alert, Spinner } from "react-bootstrap";
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
    profile_picture_base64: null 
  });

  const userId = localStorage.getItem("userId");
  const API_URL = "http://localhost:5000"; 

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile(userId);
      const user = res.user || res.data || res; 

      if (user) {
        setUserData(prev => ({
          ...prev,
          fullName: user.fullName || "",
          username: user.username || "",
          email: user.email || "",
          previewImage: user.profile_picture 
            ? `${API_URL}/uploads/${user.profile_picture}` 
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({
          ...prev,
          previewImage: previewUrl,
          profile_picture_base64: reader.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    const payload = {
      fullName: userData.fullName,
      username: userData.username,
      ...(userData.password && { password: userData.password }),
      ...(userData.profile_picture_base64 && { profile_picture_base64: userData.profile_picture_base64 })
    };

    try {
      const res = await updateUserProfile(userId, payload);
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      setIsEditing(false);
      setUserData(prev => ({ ...prev, password: "" })); 
      
      localStorage.setItem("username", userData.username);
      if (res.data && res.data.profile_picture) {
          localStorage.setItem("profile_picture", res.data.profile_picture);
      }
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      console.error(error);
      setMessage({ type: "danger", text: error.message || "Gagal update profil" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Card.Body className="p-4 p-md-5">
          
          {/* --- BAGIAN FOTO & HEADER --- */}
          <div className="text-center mb-4">
            <div className="profile-img-wrapper">
              <Image 
                src={userData.previewImage} 
                className="profile-img"
                onError={(e) => e.target.src = "https://via.placeholder.com/150"}
              />
              {isEditing && (
                <label htmlFor="upload-photo" className="img-overlay">
                  <i className="bi bi-camera-fill fs-4 mb-1"></i>
                  <span className="upload-label">Ubah Foto</span>
                  <input type="file" id="upload-photo" hidden onChange={handleImageChange} accept="image/*" />
                </label>
              )}
            </div>
            <h3 className="profile-name">{userData.fullName || "Pengguna"}</h3>
            <p className="profile-username">@{userData.username || "username"}</p>
          </div>

          {message && (
            <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="mb-4 shadow-sm">
              {message.text}
            </Alert>
          )}

          {/* --- BAGIAN FORM --- */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Nama Lengkap</Form.Label>
              <Form.Control 
                type="text" 
                name="fullName" 
                value={userData.fullName} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className="form-control-custom" 
                placeholder="Masukkan nama lengkap"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Username</Form.Label>
              <Form.Control 
                type="text" 
                name="username" 
                value={userData.username} 
                onChange={handleChange} 
                disabled={!isEditing} 
                className="form-control-custom" 
                placeholder="Masukkan username"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Email</Form.Label>
              <Form.Control 
                type="email" 
                value={userData.email} 
                disabled 
                className="form-control-custom text-muted" 
              />
            </Form.Group>

            {isEditing && (
              <Form.Group className="mb-4">
                <Form.Label className="form-label-custom">Password Baru</Form.Label>
                <Form.Control 
                  type="password" 
                  name="password" 
                  placeholder="Kosongkan jika tidak ingin mengubah" 
                  value={userData.password} 
                  onChange={handleChange} 
                  className="form-control-custom" 
                />
              </Form.Group>
            )}

            <div className="d-grid gap-2 mt-5">
              {!isEditing ? (
                <Button 
                  className="btn-action btn-primary-custom" 
                  size="lg" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profil
                </Button>
              ) : (
                <div className="d-flex gap-3">
                  <Button 
                    className="btn-action btn-secondary-custom flex-fill" 
                    onClick={() => setIsEditing(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    className="btn-action btn-primary-custom flex-fill" 
                    disabled={saving}
                  >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;