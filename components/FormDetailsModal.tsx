'use client';

import { useEffect } from 'react';
import { X, User, Users, FolderOpen, Calendar, Mail, Phone, GraduationCap, Crown, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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

interface FormDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: FormSubmission | null;
}

export default function FormDetailsModal({ isOpen, onClose, submission }: FormDetailsModalProps) {
  // ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !submission) return null;

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'idea':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return 'Belirtilmemiş';
    
    switch (status.toLowerCase()) {
      case 'idea':
        return 'Fikir';
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Tamamlandı';
      case 'paused':
        return 'Duraklatıldı';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Form Detayları
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kişisel Bilgiler */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Kişisel Bilgiler</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                    <p className="text-gray-900 font-medium">
                      {submission.firstName} {submission.lastName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{submission.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefon</label>
                      <p className="text-gray-900">{submission.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Üniversite</label>
                      <p className="text-gray-900">{submission.university}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bölüm</label>
                    <p className="text-gray-900">{submission.department}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sınıf</label>
                    <p className="text-gray-900">{submission.classYear}. Sınıf</p>
                  </div>
                </div>
              </div>

              {/* Klan Bilgileri */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Klan Bilgileri</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Klan Adı</label>
                    <p className="text-gray-900 font-medium">{submission.clanName}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Rol</label>
                      <p className="text-gray-900">
                        {submission.clanRole === 'leader' ? 'Lider' : 'Üye'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Proje Bilgileri - Full Width */}
            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Proje Bilgileri ({submission.projects?.length || 0} proje)
                </h3>
              </div>
              
              {submission.projects && submission.projects.length > 0 ? (
                <div className="space-y-6">
                  {submission.projects.map((project, projectIndex) => (
                    <div key={projectIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">{projectIndex + 1}</span>
                        </div>
                        <h4 className="text-md font-semibold text-gray-900">Proje {projectIndex + 1}</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Proje Adı</label>
                          <p className="text-gray-900 font-medium">{project.projectName || 'Belirtilmemiş'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Kategori</label>
                          <p className="text-gray-900">{project.projectCategory || 'Belirtilmemiş'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Durum</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.projectStatus)}`}>
                            {getStatusText(project.projectStatus)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-500">Proje Açıklaması</label>
                        <div className="mt-2 p-4 bg-white rounded-lg border">
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {project.projectSummary || 'Açıklama belirtilmemiş'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-500">Teknoloji Etiketleri</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.projectTechTags && project.projectTechTags.length > 0 ? (
                            project.projectTechTags.map((tag, tagIndex) => (
                              <span 
                                key={tagIndex}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">Teknoloji etiketi belirtilmemiş</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Proje bilgisi bulunamadı</p>
                </div>
              )}
            </div>

            {/* Tarih Bilgisi */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Kayıt Tarihi</label>
                  <p className="text-gray-900">
                    {formatDate(submission.submittedAt?.toDate?.() || new Date())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="btn-outline btn-md"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
