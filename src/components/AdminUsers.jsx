


import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="p-10 mt-20 top-20">

      <h1 className="text-2xl font-bold mb-5">
        Manage Users
      </h1>

      {users.map((u) => (
        <div key={u.user_id} className="bg-white p-4 mb-3 shadow rounded">

          <p><b>Name:</b> {u.fullname}</p>
          <p><b>Email:</b> {u.email}</p>
          <p><b>Role:</b> {u.role}</p>

        </div>
      ))}

    </div>
  );
}