'use client';

import { useState, useEffect } from 'react';
import { Users, Download, Eye, Trash2, Search, Filter, BarChart3, TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import FormDetailsModal from '@/components/FormDetailsModal';

interface Project {
  projectName: string;
  projectSummary: string;
  projectCategory: string;
  projectTechTags: string[];
  projectStatus: string;
}

interface FormSubmission {
  id: string;
  // Kişisel Bilgiler
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  classYear: string;
  
  // Klan Bilgileri
  clanName: string;
  clanRole: 'leader' | 'member';
  
  // Proje Bilgileri (artık array)
  projects: Project[];
  
  // Meta
  submittedAt: any; // Firestore Timestamp
  ipAddress?: string;
  userAgent?: string;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  // Firestore'dan veri çek
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        console.log('Fetching submissions...');
        const { firestoreService } = await import('@/lib/firestore');
        const result = await firestoreService.getAllSubmissions();
        console.log('Firestore result:', result);
        if (result.success && result.data) {
          console.log('Submissions data:', result.data);
          setSubmissions(result.data as FormSubmission[]);
        } else {
          console.error('Error fetching submissions:', result.error);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.clanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.projects.some(project => 
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesUniversity = !filterUniversity || submission.university === filterUniversity;
    const matchesCategory = !filterCategory || submission.projects.some(project => 
      project.projectCategory === filterCategory
    );
    
    return matchesSearch && matchesUniversity && matchesCategory;
  });

  const uniqueUniversities = Array.from(new Set(submissions.map(s => s.university)));
  const uniqueCategories = Array.from(new Set(
    submissions.flatMap(s => s.projects.map(p => p.projectCategory))
  ));

  // Silme fonksiyonu
  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      return;
    }

    setDeletingId(id);
    try {
      const { firestoreService } = await import('@/lib/firestore');
      const result = await firestoreService.deleteSubmission(id);
      
      if (result.success) {
        // Başarılı silme - state'i güncelle
        setSubmissions(prev => prev.filter(submission => submission.id !== id));
        alert('Kayıt başarıyla silindi!');
      } else {
        alert('Silme işlemi başarısız: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Silme işlemi sırasında hata oluştu!');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) return;
    
    const headers = [
      'Ad', 'Soyad', 'Email', 'Telefon', 'Üniversite', 'Bölüm', 'Sınıf',
      'Klan Adı', 'Klan Rolü',
      'Proje Adı', 'Proje Açıklaması', 'Proje Kategorisi', 'Teknoloji Etiketleri', 'Proje Durumu',
      'Tarih'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.flatMap(submission => 
        submission.projects.map(project => [
          submission.firstName,
          submission.lastName,
          submission.email,
          submission.phone,
          submission.university,
          submission.department,
          submission.classYear,
          submission.clanName,
          submission.clanRole === 'leader' ? 'Lider' : 'Üye',
          project.projectName,
          `"${project.projectSummary}"`,
          project.projectCategory,
          `"${project.projectTechTags.join(', ')}"`,
          project.projectStatus,
          formatDate(submission.submittedAt?.toDate?.() || new Date())
        ].join(','))
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `form-submissions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8" />
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
              <span className="ml-4 text-sm text-gray-600">
                {submissions.length} kayıt
              </span>
            </div>
            <button
              onClick={exportToCSV}
              className="btn-primary btn-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV İndir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kayıt</p>
                <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bugün</p>
                <p className="text-3xl font-bold text-gray-900">
                  {submissions.filter(s => {
                    const today = new Date().toDateString();
                    const submissionDate = s.submittedAt?.toDate?.()?.toDateString() || new Date().toDateString();
                    return submissionDate === today;
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Üniversite Sayısı</p>
                <p className="text-3xl font-bold text-gray-900">{uniqueUniversities.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Klan Sayısı</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Array.from(new Set(submissions.map(s => s.clanName))).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ad, soyad, üniversite, klan veya proje ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <select
              value={filterUniversity}
              onChange={(e) => setFilterUniversity(e.target.value)}
              className="select"
            >
              <option value="">Tüm Üniversiteler</option>
              {uniqueUniversities.map((university, index) => (
                <option key={`university-${index}`} value={university}>
                  {university}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="select"
            >
              <option value="">Tüm Kategoriler</option>
              {uniqueCategories.map((category, index) => (
                <option key={`category-${index}`} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Form Kayıtları ({filteredSubmissions.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kişisel Bilgiler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klan Bilgileri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proje Bilgileri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Henüz kayıt bulunmuyor.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {submission.firstName} {submission.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{submission.phone}</div>
                          <div className="text-sm text-gray-500">
                            {submission.university} - {submission.department}
                          </div>
                          <div className="text-sm text-gray-500">{submission.classYear}. Sınıf</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {submission.clanName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.clanRole === 'leader' ? 'Lider' : 'Üye'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {submission.projects && submission.projects.length > 0 ? (
                            <>
                              <div className="text-sm font-medium text-gray-900">
                                {submission.projects[0].projectName}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {submission.projects[0].projectSummary}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {(submission.projects[0].projectTechTags || []).slice(0, 3).map((tag, index) => (
                                  <span key={index} className="badge badge-outline text-xs">
                                    {tag}
                                  </span>
                                ))}
                                {(submission.projects[0].projectTechTags || []).length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{(submission.projects[0].projectTechTags || []).length - 3} daha
                                  </span>
                                )}
                              </div>
                              {submission.projects.length > 1 && (
                                <div className="text-xs text-blue-600 mt-1">
                                  +{submission.projects.length - 1} proje daha
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">Proje bilgisi yok</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(submission.submittedAt?.toDate?.() || new Date())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewDetails(submission)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(submission.id)}
                            disabled={deletingId === submission.id}
                            className={`text-red-600 hover:text-red-900 ${
                              deletingId === submission.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Details Modal */}
      <FormDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        submission={selectedSubmission}
      />
    </div>
  );
}
