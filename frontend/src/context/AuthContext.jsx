import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const register = (name, email, password) => {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password, // In production, hash this!
      createdAt: new Date().toISOString(),
      stats: {
        totalReviews: 0,
        avgScore: 0,
        bugsFound: 0,
        codeImproved: 0
      }
    };

    setUsers([...users, newUser]);
    setUser(newUser);
    return newUser;
  };

  const login = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }
    setUser(foundUser);
    return foundUser;
  };

  const logout = () => {
    setUser(null);
  };

  const updateStats = (reviewData) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      stats: {
        totalReviews: user.stats.totalReviews + 1,
        avgScore: Math.round(((user.stats.avgScore * user.stats.totalReviews) + reviewData.score) / (user.stats.totalReviews + 1)),
        bugsFound: user.stats.bugsFound + (reviewData.bugs?.length || 0),
        codeImproved: user.stats.codeImproved + (reviewData.improvedCode ? 1 : 0)
      }
    };

    setUser(updatedUser);
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
