'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, User, Users, Briefcase, Plus, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DEPARTMENTS_BY_FACULTY, FACULTIES } from '@/lib/departments';

// Proje şeması
const projectSchema = z.object({
  projectName: z.string().min(2, 'Proje adı en az 2 karakter olmalı').max(200, 'Proje adı en fazla 200 karakter olabilir'),
  projectSummary: z.string().min(10, 'Proje açıklaması en az 10 karakter olmalı').max(1000, 'Proje açıklaması en fazla 1000 karakter olabilir'),
  projectCategory: z.enum(['software', 'robotics', 'design', 'ai', 'mobile', 'web', 'other'], { required_error: 'Kategori seçin' }),
  projectTechTags: z.array(z.string().max(50)).max(10, 'En fazla 10 etiket ekleyebilirsiniz').optional().default([]),
  projectStatus: z.enum(['idea', 'active', 'completed', 'paused'], { required_error: 'Durum seçin' }),
});

// Form validation schema - 3 bölüm
const formSchema = z.object({
  // Kişisel Bilgiler
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı').max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı').max(50, 'Soyad en fazla 50 karakter olabilir'),
  email: z.string().email('Geçerli bir email adresi girin'),
  phone: z.string().regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası girin'),
  university: z.string().default('Yıldız Teknik Üniversitesi'),
  department: z.string().min(2, 'Bölüm adı gerekli').max(100, 'Bölüm adı çok uzun'),
  classYear: z.string().min(1, 'Sınıf seçin'),
  
  // Klan Bilgileri
  clanName: z.string().min(2, 'Klan adı en az 2 karakter olmalı').max(100, 'Klan adı en fazla 100 karakter olabilir'),
  clanRole: z.enum(['leader', 'member'], { required_error: 'Rol seçin' }),
  
  // Proje Bilgileri (artık array)
  projects: z.array(projectSchema).min(1, 'En az bir proje girmelisiniz').max(5, 'En fazla 5 proje ekleyebilirsiniz'),
  
  // Onay
  consentKVKK: z.boolean().refine(val => val === true, 'KVKK onayı zorunludur'),
});

type FormData = z.infer<typeof formSchema>;

const CATEGORIES = [
  { value: 'software', label: 'Yazılım Geliştirme' },
  { value: 'robotics', label: 'Robotik' },
  { value: 'design', label: 'Tasarım' },
  { value: 'ai', label: 'Yapay Zeka' },
  { value: 'mobile', label: 'Mobil Uygulama' },
  { value: 'web', label: 'Web Geliştirme' },
  { value: 'other', label: 'Diğer' },
];

const STATUS_OPTIONS = [
  { value: 'idea', label: 'Fikir Aşamasında' },
  { value: 'active', label: 'Aktif Geliştirme' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'paused', label: 'Beklemede' },
];

const CLASS_OPTIONS = [
  { value: 'hazirlik', label: 'Hazırlık' },
  { value: '1', label: '1. Sınıf' },
  { value: '2', label: '2. Sınıf' },
  { value: '3', label: '3. Sınıf' },
  { value: '4', label: '4. Sınıf' },
  { value: 'yuksek_lisans', label: 'Yüksek Lisans' },
  { value: 'doktora', label: 'Doktora' },
];

const TECH_TAGS = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'C#', 'C++', 'JavaScript', 'TypeScript',
  'Flutter', 'React Native', 'Swift', 'Kotlin', 'Django', 'Flask', 'Express.js', 'Laravel', 'Spring',
  'TensorFlow', 'PyTorch', 'OpenCV', 'Unity', 'Unreal Engine', 'Figma', 'Adobe XD', 'Sketch',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis'
];

export default function FormPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techTagInputs, setTechTagInputs] = useState<Record<number, string>>({});
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      projects: [
        {
          projectName: '',
          projectSummary: '',
          projectCategory: undefined,
          projectTechTags: [],
          projectStatus: undefined,
        },
      ],
    },
  });

  const watchedProjects = watch('projects', []);

  const addProject = () => {
    if (watchedProjects.length < 5) {
      setValue('projects', [
        ...watchedProjects,
        {
          projectName: '',
          projectSummary: '',
          projectCategory: undefined as any,
          projectTechTags: [],
          projectStatus: undefined as any,
        },
      ]);
      toast.success('Yeni proje eklendi');
    } else {
      toast.error('En fazla 5 proje ekleyebilirsiniz');
    }
  };

  const removeProject = (index: number) => {
    if (watchedProjects.length > 1) {
      const newProjects = watchedProjects.filter((_, i) => i !== index);
      setValue('projects', newProjects);
      toast.success('Proje silindi');
    } else {
      toast.error('En az bir proje girmelisiniz');
    }
  };

  const addTechTag = (projectIndex: number, tag: string) => {
    const project = watchedProjects[projectIndex];
    if (tag && !project.projectTechTags.includes(tag) && project.projectTechTags.length < 10) {
      const newProjects = [...watchedProjects];
      newProjects[projectIndex] = {
        ...project,
        projectTechTags: [...project.projectTechTags, tag],
      };
      setValue('projects', newProjects);
      setTechTagInputs({ ...techTagInputs, [projectIndex]: '' });
    }
  };

  const removeTechTag = (projectIndex: number, tagToRemove: string) => {
    const project = watchedProjects[projectIndex];
    const newProjects = [...watchedProjects];
    newProjects[projectIndex] = {
      ...project,
      projectTechTags: project.projectTechTags.filter(tag => tag !== tagToRemove),
    };
    setValue('projects', newProjects);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Doğrudan Firestore'a kaydet
      const { firestoreService } = await import('@/lib/firestore');
      const result = await firestoreService.saveSubmission(data);

      if (result.success) {
        toast.success('Bilgileriniz başarıyla kaydedildi!');
        // Success sayfasına yönlendir
        router.push('/form/success');
      } else {
        toast.error('Veri kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      // Her adım için gerekli alanları kontrol et
      const formData = watch();
      
      if (currentStep === 1) {
        // Kişisel bilgiler kontrolü
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.department || !formData.classYear) {
          toast.error('Lütfen tüm zorunlu alanları doldurun');
          return;
        }
      } else if (currentStep === 2) {
        // Klan bilgileri kontrolü
        if (!formData.clanName || !formData.clanRole) {
          toast.error('Lütfen tüm zorunlu alanları doldurun');
          return;
        }
      }
      
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kişisel Bilgiler</h2>
              <p className="text-gray-600">Lütfen kişisel bilgilerinizi girin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="form-group">
                <label className="form-label">Ad *</label>
                <input
                  {...register('firstName')}
                  className="input"
                  placeholder="Adınız"
                />
                {errors.firstName && (
                  <p className="form-error">{errors.firstName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Soyad *</label>
                <input
                  {...register('lastName')}
                  className="input"
                  placeholder="Soyadınız"
                />
                {errors.lastName && (
                  <p className="form-error">{errors.lastName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  {...register('email')}
                  type="email"
                  className="input"
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Telefon *</label>
                <input
                  {...register('phone')}
                  className="input"
                  placeholder="05XX XXX XX XX"
                />
                {errors.phone && (
                  <p className="form-error">{errors.phone.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Üniversite *</label>
                <input
                  {...register('university')}
                  className="input"
                  value="Yıldız Teknik Üniversitesi"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bölüm *</label>
                <select {...register('department')} className="select">
                  <option value="">Bölüm seçin</option>
                  {FACULTIES.map((fakulte) => (
                    <optgroup key={fakulte} label={fakulte}>
                      {DEPARTMENTS_BY_FACULTY[fakulte].map((bolum) => (
                        <option key={bolum} value={bolum}>
                          {bolum}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {errors.department && (
                  <p className="form-error">{errors.department.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Sınıf *</label>
                <select {...register('classYear')} className="select">
                  <option value="">Sınıf seçin</option>
                  {CLASS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.classYear && (
                  <p className="form-error">{errors.classYear.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Klan Bilgileri</h2>
              <p className="text-gray-600">Klan bilgilerinizi girin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="form-group">
                <label className="form-label">Klan Adı *</label>
                <input
                  {...register('clanName')}
                  className="input"
                  placeholder="Klan adınız"
                />
                {errors.clanName && (
                  <p className="form-error">{errors.clanName.message}</p>
                )}
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Rol *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...register('clanRole')}
                      type="radio"
                      value="leader"
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <div className="font-medium">Lider</div>
                      <div className="text-sm text-gray-500">Klanı yönetir</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      {...register('clanRole')}
                      type="radio"
                      value="member"
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <div className="font-medium">Üye</div>
                      <div className="text-sm text-gray-500">Klan üyesi</div>
                    </div>
                  </label>
                </div>
                {errors.clanRole && (
                  <p className="form-error">{errors.clanRole.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Proje Bilgileri</h2>
              <p className="text-gray-600">Proje bilgilerinizi girin (en fazla 5 proje)</p>
            </div>

            <div className="space-y-6">
              {watchedProjects.map((project, projectIndex) => (
                <div key={projectIndex} className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Proje {projectIndex + 1}
                    </h3>
                    {watchedProjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProject(projectIndex)}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Sil
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Proje Adı *</label>
                      <input
                        {...register(`projects.${projectIndex}.projectName`)}
                        className="input"
                        placeholder="Proje adınız"
                      />
                      {errors.projects?.[projectIndex]?.projectName && (
                        <p className="form-error">{errors.projects[projectIndex]?.projectName?.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Proje Açıklaması *</label>
                      <textarea
                        {...register(`projects.${projectIndex}.projectSummary`)}
                        className="textarea"
                        rows={4}
                        placeholder="Projenizi kısaca açıklayın"
                      />
                      {errors.projects?.[projectIndex]?.projectSummary && (
                        <p className="form-error">{errors.projects[projectIndex]?.projectSummary?.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">Kategori *</label>
                        <select {...register(`projects.${projectIndex}.projectCategory`)} className="select">
                          <option value="">Kategori seçin</option>
                          {CATEGORIES.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                        {errors.projects?.[projectIndex]?.projectCategory && (
                          <p className="form-error">{errors.projects[projectIndex]?.projectCategory?.message}</p>
                        )}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Durum *</label>
                        <select {...register(`projects.${projectIndex}.projectStatus`)} className="select">
                          <option value="">Durum seçin</option>
                          {STATUS_OPTIONS.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                        {errors.projects?.[projectIndex]?.projectStatus && (
                          <p className="form-error">{errors.projects[projectIndex]?.projectStatus?.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Teknoloji Etiketleri (Opsiyonel)</label>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={techTagInputs[projectIndex] || ''}
                            onChange={(e) => setTechTagInputs({ ...techTagInputs, [projectIndex]: e.target.value })}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTechTag(projectIndex, techTagInputs[projectIndex] || '');
                              }
                            }}
                            className="input flex-1 w-full"
                            placeholder="Etiket ekleyin ve Enter'a basın"
                          />
                          <button
                            type="button"
                            onClick={() => addTechTag(projectIndex, techTagInputs[projectIndex] || '')}
                            className="btn-primary btn-sm w-full sm:w-auto"
                          >
                            Ekle
                          </button>
                        </div>
                        
                        {project.projectTechTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.projectTechTags.map(tag => (
                              <span
                                key={tag}
                                className="badge badge-default flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTechTag(projectIndex, tag)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-sm text-gray-600">
                          <p>Popüler etiketler:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {TECH_TAGS.slice(0, 10).map(tag => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => addTechTag(projectIndex, tag)}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {errors.projects?.[projectIndex]?.projectTechTags && (
                        <p className="form-error">{errors.projects[projectIndex]?.projectTechTags?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {watchedProjects.length < 5 && (
                <button
                  type="button"
                  onClick={addProject}
                  className="w-full btn-outline btn-md flex items-center justify-center gap-2 border-dashed border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Proje Ekle
                </button>
              )}

              <div className="form-group">
                <label className="flex items-start space-x-3">
                  <input
                    {...register('consentKVKK')}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                  <div className="text-sm text-gray-700">
                    <span className="font-medium text-blue-600 cursor-pointer hover:text-blue-800 underline" 
                          onClick={() => setShowPrivacyModal(true)}>
                      Gizlilik Politikası
                    </span> kapsamında kişisel verilerimin işlenmesine onay veriyorum. *
                  </div>
                </label>
                {errors.consentKVKK && (
                  <p className="form-error">{errors.consentKVKK.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Gizlilik Politikası</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="text-gray-600 mb-4">Son Güncelleme: 07.04.2025</div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">1. Kişisel Verilerinizi Nasıl İşlemekteyiz?</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">a. Üyelik Kaydınız</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Uygulamamızda üyeliğinizin aktif hale gelmesi amacıyla kişisel verileriniz "bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması" ve "ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması" prensipleri uyarınca hukuki ve site deneyimi için gerekli olan koşullara dayanır şekilde otomatik olarak işlenmektedir.
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mt-2">
                      Uygulamamız ve/veya sitemiz tarafınca tarafınıza ait erişilen bilgiler temel olarak şunlardır:
                    </p>
                    <ul className="text-sm text-gray-700 ml-4 mt-2">
                      <li>• Öğrenim Görülen Üniversite Bilgisi</li>
                      <li>• E-posta Adresi</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">b. Web Uygulaması Kullanımı</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Üye kayıt işlemlerinizin tarafınızca tamamlanması sonrasında yalnızca bireysel e-posta adresinizi ve şifrenizi girmek suretiyle Classhopper web uygulamasına giriş yapılabilmektedir. Uygulamaya girişinizin sonrasında profilinizin oluşturulması amacıyla kayıt sırasında işlenilen verilerinizin haricinde isim, soyisim ve e-posta adresinden oluşan kişisel verileriniz "bir sözleşmenin kurulması veya işlenmesinin gerekli olması" ve "ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlemesinin zorunlu olması" hukuki nedenlerine dayanarak otomatik yollarla işlenmektedir.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">c. Elektronik Ticari İleti</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      6563 Sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve 15 Temmuz 2015 tarihli Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik uyarınca hizmet sağlayıcı sıfatı ile ticari elektronik iletilerin Classhopper tarafından tarafınıza gönderilmesi için vereceğiniz onayınıza istinaden iletişim verileriniz (e-posta adresiniz vb.) işlenebilecek olup ilgili ticari elektronik ileti iletimi tarafınızca reddetme hakkınız kullanılmadığı müddetçe devam edecektir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">2. Kişisel Verilerinizin Aktarılması</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Şirketimizce kişisel verileriniz hukuki sebepleri meşru tutularak yalnızca ilgili işlemlerin gerçekleştirilmesi maksadına hizmet eder şekilde ilgili kampanya ve/veya hizmetlerden faydalanmanız amacıyla hizmet sağlayıcısına aktarılmaktadır. İlgili aktarım kapsamında kişisel verilerinizin aktarımı "bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması" ve "ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması" hukuki sebepleri ile gerçekleştirilmektedir.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">3. İlgili Kişi Olarak Haklarınızın Kullanılması</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  İlgili kişinin haklarını düzenleyen Kanunun 11'inci maddesi dahilindeki haklarınızı kullanabilirsiniz:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Kişisel verilerinizi Şirket'in işleyip işlemediğini öğrenme</li>
                  <li>• Kişisel verileriniz Şirket tarafından işlemişse, buna dair Şirket'ten bilgi talep etme</li>
                  <li>• Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığı öğrenme</li>
                  <li>• Yurtiçi veya yurtdışına kişisel verilerin aktarılıp aktarılmadığını ve aktarıldıysa kimlere aktarıldığını öğrenme</li>
                  <li>• Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
                  <li>• Kanun'un 7'inci maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin yok edilmesini, silinmesini veya anonimleştirilmesini isteme</li>
                  <li>• Kişisel verilerinizin talebiniz üzerine, eksik veya yanlış işlenmiş olması nedeniyle düzeltilmesi ve/veya Kanun'un 7'inci maddesinde öngörülen şartlar çerçevesinde silinmesi veya yok edilmesi halinde yapılan işlemlerin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                  <li>• İşlenen kişisel verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize ortaya çıkan bir sonuç var ise bu duruma itiraz etme</li>
                  <li>• Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                </ul>
                <p className="text-sm text-gray-700 leading-relaxed mt-3">
                  İstek ve taleplerinizi, Başvuru Usul ve Esasları Hakkında Tebliğe uygun bir şekilde veri sorumlusu olan Classhopper'a hello@classhopper.ai elektronik posta adresimiz üzerinden iletebilirsiniz.
                </p>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t flex-shrink-0">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="btn-primary btn-md"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 gap-4">
            <Link href="/" className="flex items-center text-primary-600 hover:text-primary-700 text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Ana Sayfa</span>
              <span className="sm:hidden">Geri</span>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 text-center">Classhopper Kayıt Formu</h1>
            <div className="hidden sm:block w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
              <span className="text-sm font-medium text-gray-700">
                Adım {currentStep} / 3
              </span>
              <span className="text-sm text-gray-500">
                %{Math.round((currentStep / 3) * 100)} tamamlandı
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-outline btn-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto border-primary-600 text-primary-600 hover:bg-primary-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary btn-md flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                İleri
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="btn-primary btn-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Gönder
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}