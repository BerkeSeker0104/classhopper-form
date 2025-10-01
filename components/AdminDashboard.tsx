'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DashboardStats {
  totalStudents: number;
  totalClans: number;
  totalProjects: number;
  pendingSubmissions: number;
  pendingThreads: number;
  pendingPosts: number;
  todaySubmissions: number;
  weekSubmissions: number;
  monthSubmissions: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalClans: 0,
    totalProjects: 0,
    pendingSubmissions: 0,
    pendingThreads: 0,
    pendingPosts: 0,
    todaySubmissions: 0,
    weekSubmissions: 0,
    monthSubmissions: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError('Giriş başarısız. Email ve şifrenizi kontrol edin.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Mock data - in production, this would come from Firestore
  useEffect(() => {
    if (user) {
      setStats({
        totalStudents: 245,
        totalClans: 34,
        totalProjects: 58,
        pendingSubmissions: 7,
        pendingThreads: 3,
        pendingPosts: 5,
        todaySubmissions: 12,
        weekSubmissions: 45,
        monthSubmissions: 156,
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Girişi</h1>
            <p className="text-gray-600">Classhopper Admin Paneli</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@classhopper.com"
                required
              />
            </div>

            <div>
              <label className="form-label">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="text-red-600 text-sm">{loginError}</div>
            )}

            <button type="submit" className="btn-primary btn-md w-full">
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="btn-outline btn-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary btn-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button className="btn-outline btn-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Kayıtlar
            </button>
            <button className="btn-outline btn-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Forum
            </button>
            <button className="btn-outline btn-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Ayarlar
            </button>
          </div>
        </nav>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Öğrenci</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12 bu ay
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Klan</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClans}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +3 bu ay
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Proje</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8 bu ay
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen Onay</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-yellow-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              İnceleme bekliyor
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Form Gönderimleri</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ali Yılmaz</p>
                    <p className="text-sm text-gray-600">İTÜ - Bilgisayar Mühendisliği</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
                  <span className="badge badge-warning">Bekliyor</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ayşe Demir</p>
                    <p className="text-sm text-gray-600">Boğaziçi - Endüstri Mühendisliği</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
                  <span className="badge badge-success">Onaylandı</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bekleyen Moderasyon</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Yeni Proje Fikri</p>
                    <p className="text-sm text-gray-600">Proje Fikirleri</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary btn-sm">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="btn-outline btn-sm">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Klan Arayanlar</p>
                    <p className="text-sm text-gray-600">Ekip Arıyorum</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary btn-sm">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="btn-outline btn-sm">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="card p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Kayıtları Yönet</h4>
              </div>
              <p className="text-sm text-gray-600">Öğrenci, klan ve proje kayıtlarını görüntüle ve düzenle</p>
            </button>

            <button className="card p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Forum Moderasyonu</h4>
              </div>
              <p className="text-sm text-gray-600">Bekleyen konu ve mesajları onayla veya reddet</p>
            </button>

            <button className="card p-6 text-left hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Analitik Raporlar</h4>
              </div>
              <p className="text-sm text-gray-600">Detaylı istatistikler ve raporları görüntüle</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
