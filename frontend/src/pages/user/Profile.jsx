import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Image, Alert, Spinner } from "react-bootstrap";
import { getUserById, updateUserProfile } from "../../services/userService";
import { getImageUrl } from "../../utils/imageUtils"; 

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const userId = localStorage.getItem("userId"); 

  useEffect(() => {
    if (userId) {
      fetchUserData();
    } else {
      setError("User ID not found. Please login again.");
      setLoading(false);
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const res = await getUserById(userId);
      if (res.success && res.user) { // ✅ Tambahkan pengecekan res.user
        setUser(res.user);
        setFormData({
          username: res.user.username || "",
          email: res.user.email || "",
          phone: res.user.phone || "",
        });
      } else {
        setError("Failed to retrieve user data.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // ✅ PERBAIKAN: Cek apakah file benar-benar ada (user tidak menekan cancel di dialog)
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // ✅ DEBUGGING: Cek data sebelum dikirim
    console.log("Submitting Profile Update...");
    console.log("Data:", formData);
    console.log("File:", selectedFile);

    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    if (selectedFile) {
      data.append("profile_picture", selectedFile);
    }

    try {
      if (!userId) throw new Error("User ID is missing");

      const res = await updateUserProfile(userId, data);
      
      if (res.success) {
        setSuccess("Profile updated successfully!");
        setUser(res.user); 
        
        // Update LocalStorage
        localStorage.setItem("username", res.user.username);
        // Pastikan tidak menyimpan 'null' string jika kosong
        localStorage.setItem("profile_picture", res.user.profile_picture || "");

        setEditing(false);
        // Reset file state setelah sukses
        setSelectedFile(null); 
        setPreview(null);
        
        // Reload untuk update Navbar
        window.location.reload(); 
      } else {
        setError(res.message || "Update failed");
      }
    } catch (err) {
      console.error("Update Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Reset saat Cancel
  const handleCancel = () => {
    setEditing(false);
    setPreview(null);
    setSelectedFile(null); // ✅ PERBAIKAN: Reset file yang dipilih agar tidak ikut terkirim nanti
    // Kembalikan form data ke data user asli
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  };

  if (loading && !user) return <div className="text-center p-5"><Spinner animation="border"/></div>;

  return (
    <Container className="py-5" style={{maxWidth: "600px"}}>
      <h2 className="mb-4 fw-bold">My Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-4 text-center">
          {/* Foto Profil */}
          <div className="mb-4">
            <Image 
              src={preview || getImageUrl(user?.profile_picture)} 
              roundedCircle 
              style={{ width: "150px", height: "150px", objectFit: "cover", border: "4px solid #f8f9fa" }}
              onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=User"; }} // Fallback jika gambar error
            />
          </div>

          {!editing ? (
            // --- VIEW MODE ---
            <div>
              <h3>{user?.username}</h3>
              <p className="text-muted mb-1">{user?.email}</p>
              <p className="text-muted">{user?.phone || "No phone number"}</p>
              <p className="badge bg-secondary">{user?.role}</p>
              <hr />
              <Button variant="primary" onClick={() => setEditing(true)}>Edit Profile</Button>
            </div>
          ) : (
            // --- EDIT MODE ---
            <Form onSubmit={handleSubmit} className="text-start">
              <Form.Group className="mb-3">
                <Form.Label>Profile Picture</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </Form.Group>

              <div className="d-flex gap-2 justify-content-center">
                <Button variant="success" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;