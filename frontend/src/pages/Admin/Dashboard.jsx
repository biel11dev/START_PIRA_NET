import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaHome, FaBox, FaList, FaShoppingBag, FaLightbulb, FaSignOutAlt, FaBars, FaTimes, FaCog } from 'react-icons/fa';
import Products from './Products';
import Categories from './Categories';
import Orders from './Orders';
import Suggestions from './Suggestions';
import Settings from './Settings';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', icon: <FaHome />, label: 'Dashboard' },
    { path: '/admin/products', icon: <FaBox />, label: 'Produtos' },
    { path: '/admin/categories', icon: <FaList />, label: 'Categorias' },
    { path: '/admin/orders', icon: <FaShoppingBag />, label: 'Pedidos' },
    { path: '/admin/suggestions', icon: <FaLightbulb />, label: 'Sugestões' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Configurações' },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/start.png" alt="Start Pira" className="sidebar-logo" />
          <h2>Admin Painel</h2>
          <button className="close-menu" onClick={() => setMenuOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-item"
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.name || user?.email}</strong>
            <span>Administrador</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main-content">
        <header className="dashboard-header">
          <button className="menu-toggle" onClick={() => setMenuOpen(true)}>
            <FaBars />
          </button>
          <h1>Painel Administrativo</h1>
          <button className="btn-view-menu" onClick={() => navigate('/')}>
            Ver Menu Público
          </button>
        </header>

        <div className="content-area">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="suggestions" element={<Suggestions />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </div>

      {/* Overlay for mobile */}
      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}

function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-home">
      <h2>Bem-vindo ao Painel Administrativo</h2>
      <p>Selecione uma opção no menu lateral para começar.</p>
      
      <div className="dashboard-cards">
        <Link to="/admin/products" className="dash-card">
          <FaBox size={40} />
          <h3>Produtos</h3>
          <p>Gerencie seu cardápio</p>
        </Link>
        <Link to="/admin/categories" className="dash-card">
          <FaList size={40} />
          <h3>Categorias</h3>
          <p>Organize suas categorias</p>
        </Link>
        <Link to="/admin/orders" className="dash-card">
          <FaShoppingBag size={40} />
          <h3>Pedidos</h3>
          <p>Acompanhe os pedidos</p>
        </Link>
        <Link to="/admin/suggestions" className="dash-card">
          <FaLightbulb size={40} />
          <h3>Sugestões</h3>
          <p>Feedback dos clientes</p>
        </Link>
        <Link to="/admin/settings" className="dash-card">
          <FaCog size={40} />
          <h3>Configurações</h3>
          <p>Banner e informações</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
