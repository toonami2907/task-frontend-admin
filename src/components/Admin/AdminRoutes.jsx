
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminProtectedRoute } from './Auth/auth';
import AdminLayout from './AdminLayout';





const AdminRoutes = () => {
  return (
    <Routes>
      {/* <Route 
        path="/utm/create" 
        element={
          <AdminProtectedRoute>
            <UTMCreate />
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/utm/list" 
        element={
          <AdminProtectedRoute>
            <UTMList />
          </AdminProtectedRoute>
        }
      /> */}
      <Route path='/admin'  element={<AdminLayout/>}></Route>
    </Routes>
  );
};

export default AdminRoutes;
