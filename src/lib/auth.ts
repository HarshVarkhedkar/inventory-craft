export interface User {
  email: string;
  name: string;
  role: string;
  token: string;
}

export const auth = {
  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token);
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  },
};
