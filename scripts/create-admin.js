const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration - bu değerleri kendi Firebase projenizden alın
const firebaseConfig = {
  apiKey: "your_api_key_here",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdminUser() {
  try {
    console.log('Admin kullanıcısı oluşturuluyor...');
    
    // Admin kullanıcısını oluştur
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@classhopper.com', 
      'admin123456' // Güçlü bir şifre kullanın
    );
    
    console.log('Admin kullanıcısı başarıyla oluşturuldu:', userCredential.user.email);
    console.log('Email: admin@classhopper.com');
    console.log('Şifre: admin123456');
    console.log('\n⚠️  ÖNEMLİ: Bu şifreyi güvenli bir yerde saklayın ve production\'da değiştirin!');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin kullanıcısı zaten mevcut. Giriş yapılıyor...');
      
      try {
        const signInResult = await signInWithEmailAndPassword(
          auth, 
          'admin@classhopper.com', 
          'admin123456'
        );
        console.log('Giriş başarılı:', signInResult.user.email);
      } catch (signInError) {
        console.error('Giriş hatası:', signInError.message);
        console.log('Mevcut şifre yanlış olabilir. Firebase Console\'dan şifreyi sıfırlayın.');
      }
    } else {
      console.error('Hata:', error.message);
    }
  }
}

createAdminUser();
