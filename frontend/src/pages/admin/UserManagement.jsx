import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Spinner, Alert } from "react-bootstrap";
import { getAllUsers, deleteUser } from "../../services/userService"; // ✅ Import API
import "./UserManagement.css";
import "./EventManagement.css";

const UserManagement = () => {
  
  // ✅ Ganti mockUsers dengan state asli
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Panggil API saat halaman dimuat
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllUsers();
      if (res.success) {
        setUsers(res.users || []);
      } else {
        setError(res.message || "Failed to fetch users.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Perbarui fungsi Hapus
  const handleUserDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This is permanent.`)) {
      try {
        const res = await deleteUser(userId);
        if (res.success) {
          alert(res.message);
          fetchUsers(); // Refresh daftar user
        } else {
          alert(`Error: ${res.message}`);
        }
      } catch (err) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  };

  // Helper untuk format tanggal (jika diperlukan)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div>
      <h1>User Management</h1>
      
      <input 
        type="text" 
        className="user-search" 
        placeholder="Search users... (Not implemented)" 
      />

      <div className="admin-table-wrapper">
        {loading && <div className="text-center p-5"><Spinner animation="border" /></div>}
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {!loading && !error && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {/* ✅ PERBAIKAN: alt="" (kosong) untuk hapus nama duplikat */}
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                      alt="" 
                      style={{width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px'}} 
                    />
                    {user.username}
                  </td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'bg-success' : 'bg-secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="btn-action delete" 
                      title="Delete User"
                      onClick={() => handleUserDelete(user.id, user.username)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;