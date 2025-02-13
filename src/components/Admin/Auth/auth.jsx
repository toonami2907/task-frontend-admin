import { Navigate } from "react-router-dom";
import PropTypes from 'prop-types';


export const AdminProtectedRoute = ({ children }) => {
  const AdminId = localStorage.getItem('AdminId');

  return AdminId ? children : <Navigate to="/auth" replace />;
};

AdminProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};