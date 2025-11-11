import React from "react";
import { Trash2 } from "lucide-react";
import "./UserManagement.css";
import "./EventManagement.css"; // Menggunakan ulang style tabel dari EventManagement

const UserManagement = () => {
  
  // CATATAN: API UNTUK GET ALL USERS TIDAK ADA DI BACKEND ANDA.
  // Data ini adalah MOCK (data palsu) untuk keperluan UI.
  const mockUsers = [
    { id: 1, name: "Nandito Maulana Yedikar", email: "nandito.my@mail.id", active: "Just now", avatar: "https://via.placeholder.com/40?text=N" },
    { id: 2, name: "Ahmad Alvin Shofa", email: "alvin.shofa.my@mail.id", active: "Just now", avatar: "https://via.placeholder.com/40?text=A" },
    { id: 3, name: "Ismiati Andini", email: "ismiati.a@mail.id", active: "Just now", avatar: "https://via.placeholder.com/40?text=I" },
    { id: 4, name: "Rizky Maulana", email: "rizky.m@mail.id", active: "Just now", avatar: "https://via.placeholder.com/40?text=R" },
    { id: 5, name: "Rius Farullah", email: "rius.f.my@mail.id", active: "Just now", avatar: "https://via.placeholder.com/40?text=R" },
  ];
  
  const handleUserDelete = (userId, userName) => {
    alert(`API untuk Hapus User (ID: ${userId}) belum terimplementasi di backend.`);
  };

  return (
    <div>
      <h1>User Management</h1>
      
      <input 
        type="text" 
        className="user-search" 
        placeholder="Search users..." 
      />

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    style={{width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px'}} 
                  />
                  {user.name}
                </td>
                <td>{user.email}</td>
                <td>{user.active}</td>
                <td className="action-buttons">
                  <button 
                    className="btn-action delete" 
                    title="Delete User (Not Implemented)"
                    onClick={() => handleUserDelete(user.id, user.name)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;