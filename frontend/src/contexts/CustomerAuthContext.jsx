import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  cadastrarCliente,
  loginCliente,
  loginClienteGoogle,
  getClienteAtual,
} from '../services/api';

const CustomerAuthContext = createContext({});

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCustomer = localStorage.getItem('customerUser');
    const token = localStorage.getItem('customerToken');
    if (storedCustomer && token) {
      setCustomer(JSON.parse(storedCustomer));
      // Revalida o token em segundo plano
      getClienteAtual()
        .then((data) => {
          setCustomer(data.customer);
          localStorage.setItem('customerUser', JSON.stringify(data.customer));
        })
        .catch(() => {
          localStorage.removeItem('customerToken');
          localStorage.removeItem('customerUser');
          setCustomer(null);
        });
    }
    setLoading(false);
  }, []);

  const persistir = (data) => {
    localStorage.setItem('customerToken', data.token);
    localStorage.setItem('customerUser', JSON.stringify(data.customer));
    setCustomer(data.customer);
  };

  const extrairErro = (error) =>
    error?.response?.data?.error || error?.message || 'Ocorreu um erro. Tente novamente.';

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginCliente(email, password);
      persistir(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: extrairErro(error) };
    }
  }, []);

  const cadastrar = useCallback(async (dados) => {
    try {
      const data = await cadastrarCliente(dados);
      persistir(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: extrairErro(error) };
    }
  }, []);

  const loginGoogle = useCallback(async (credential) => {
    try {
      const data = await loginClienteGoogle(credential);
      persistir(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: extrairErro(error) };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    setCustomer(null);
  }, []);

  const isAuthenticated = useCallback(
    () => !!customer && !!localStorage.getItem('customerToken'),
    [customer]
  );

  return (
    <CustomerAuthContext.Provider
      value={{ customer, login, cadastrar, loginGoogle, logout, isAuthenticated, loading }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth deve ser usado dentro de um CustomerAuthProvider');
  }
  return context;
}
