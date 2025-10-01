'use client';

import { CheckCircle, ArrowLeft, Home, Mail } from 'lucide-react';
import Link from 'next/link';

export default function FormSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4 sm:py-6">
            <Link href="/" className="flex items-center text-primary-600 hover:text-primary-700 text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Ana Sayfa</span>
              <span className="sm:hidden">Geri</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Form Başarıyla Tamamlandı!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Bilgileriniz başarıyla kaydedildi. Sizlere en kısa sürede dönüş yapacağız.
          </p>

          {/* Additional Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Sonraki Adımlar</span>
            </div>
            <p className="text-green-700 text-sm">
              Başvurunuz değerlendirildikten sonra, size email yoluyla bilgi verilecektir. 
              Lütfen email kutunuzu kontrol etmeyi unutmayın.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="btn-primary btn-lg flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              Ana Sayfaya Dön
            </Link>
            
            <Link 
              href="/form"
              className="btn-outline btn-lg flex items-center justify-center gap-2 w-full sm:w-auto border-primary-600 text-primary-600 hover:bg-primary-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Yeni Başvuru
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Herhangi bir sorunuz varsa
            </p>
            <p className="text-sm text-primary-600 font-medium">
              hello@classhopper.io
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
