import { useSelector } from 'react-redux'
import { Outlet, Navigate } from 'react-router-dom';

function HodPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  return currentUser && currentUser.isHod ? <Outlet /> : <Navigate to='/signin' />;
}

export default HodPrivateRoute