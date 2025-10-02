import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import Joi from 'joi';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Rate limiter
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Express app for HTTP functions
const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    await rateLimiter.consume(clientIp);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Lütfen bir dakika bekleyip tekrar deneyin.',
    });
  }
});

// Validation schemas
const projectSchema = Joi.object({
  projectName: Joi.string().min(2).max(200).required(),
  projectSummary: Joi.string().min(10).max(1000).required(),
  projectCategory: Joi.string().valid(
    'software', 'robotics', 'design', 'ai', 'mobile', 'web', 'other'
  ).required(),
  projectTechTags: Joi.array().items(Joi.string().max(50)).min(1).max(10).required(),
  projectStatus: Joi.string().valid('idea', 'active', 'completed', 'paused').required(),
});

const formSubmissionSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+90|0)?[5][0-9]{9}$/).required(),
  university: Joi.string().min(2).max(100).required(),
  department: Joi.string().min(2).max(100).required(),
  classYear: Joi.string().required(),
  clanName: Joi.string().min(2).max(100).required(),
  clanRole: Joi.string().valid('leader', 'member').required(),
  projects: Joi.array().items(projectSchema).min(1).max(5).required(),
  consentKVKK: Joi.boolean().valid(true).required(),
});

const topicSuggestionSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  body: Joi.string().min(10).max(2000).required(),
  categoryId: Joi.string().required(),
  tagIds: Joi.array().items(Joi.string()).max(5).required(),
  recaptchaToken: Joi.string().required(),
});

// Utility functions
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function normalizePhoneNumber(phone: string): string {
  if (phone.startsWith('0')) {
    return '+90' + phone.substring(1);
  }
  if (phone.startsWith('+90')) {
    return phone;
  }
  return '+90' + phone;
}

function generateDisplayHandle(firstName: string, lastName: string): string {
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomSuffix}`;
}

async function sendNotificationEmail(type: string, data: any) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    let subject = '';
    let html = '';

    switch (type) {
      case 'form_submission': {
        subject = 'Yeni Form Gönderimi - Classhopper';
        const projectsList = (data.projects || []).map((p: any, i: number) => 
          `<li><strong>Proje ${i + 1}:</strong> ${p.projectName} (${p.projectCategory})</li>`
        ).join('');
        html = `
          <h2>Yeni Form Gönderimi</h2>
          <p><strong>Ad Soyad:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Üniversite:</strong> ${data.university}</p>
          <p><strong>Bölüm:</strong> ${data.department}</p>
          <p><strong>Klan:</strong> ${data.clanName}</p>
          <p><strong>Projeler:</strong></p>
          <ul>${projectsList}</ul>
        `;
        break;
      }
      case 'topic_suggestion':
        subject = 'Yeni Konu Önerisi - Classhopper';
        html = `
          <h2>Yeni Konu Önerisi</h2>
          <p><strong>Başlık:</strong> ${data.title}</p>
          <p><strong>İçerik:</strong> ${data.body}</p>
        `;
        break;
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email gönderimi hatası:', error);
  }
}

// HTTP Functions
app.post('/submit-form', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = formSubmissionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.details[0].message,
      });
    }

    const formData = value;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Check for banned words (basic implementation)
    const bannedWords = ['spam', 'test', 'fake']; // This should come from settings
    const projectsText = (formData.projects || []).map((p: any) => `${p.projectName} ${p.projectSummary}`).join(' ');
    const textToCheck = `${formData.firstName} ${formData.lastName} ${projectsText}`.toLowerCase();
    const hasBannedWord = bannedWords.some(word => textToCheck.includes(word));
    
    if (hasBannedWord) {
      return res.status(400).json({
        success: false,
        error: 'Content not allowed',
        message: 'Gönderilen içerik uygun değil.',
      });
    }

    // Create submission record
    const submissionData = {
      payload: formData,
      ipHash: hashIP(clientIP),
      ua: userAgent,
      recaptchaScore: 0.9, // This should be validated with reCAPTCHA API
      type: 'form',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const submissionRef = await db.collection('publicSubmissions').add(submissionData);

    // Send notification email
    await sendNotificationEmail('form_submission', formData);

    return res.json({
      success: true,
      message: 'Form başarıyla gönderildi. Admin onayı bekleniyor.',
      submissionId: submissionRef.id,
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    });
  }
});

app.post('/suggest-topic', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = topicSuggestionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.details[0].message,
      });
    }

    const topicData = value;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Create submission record
    const submissionData = {
      payload: topicData,
      ipHash: hashIP(clientIP),
      ua: userAgent,
      recaptchaScore: 0.9, // This should be validated with reCAPTCHA API
      type: 'topicSuggestion',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const submissionRef = await db.collection('publicSubmissions').add(submissionData);

    // Send notification email
    await sendNotificationEmail('topic_suggestion', topicData);

    return res.json({
      success: true,
      message: 'Konu önerisi başarıyla gönderildi. Admin onayı bekleniyor.',
      submissionId: submissionRef.id,
    });

  } catch (error) {
    console.error('Topic suggestion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    });
  }
});

// Form submission endpoint
export const submitForm = functions.https.onRequest(async (req, res) => {
  // CORS headers - daha kapsamlı ayarlar
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    // Rate limiting
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    await rateLimiter.consume(clientIP);

    // Debug log
    console.log('Received form data:', JSON.stringify(req.body, null, 2));

    // Validate request body
    const { error, value } = formSubmissionSchema.validate(req.body);
    if (error) {
      console.error('Validation error:', error.details);
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    const data = value;

    // Hash IP and User Agent for privacy
    const ipHash = crypto.createHash('sha256').update(clientIP).digest('hex');
    const userAgentHash = crypto.createHash('sha256').update(req.get('User-Agent') || '').digest('hex');

    // Save to Firestore
    const submissionData = {
      ...data,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: ipHash,
      userAgent: userAgentHash,
    };

    const submissionRef = await db.collection('submissions').add(submissionData);

    // Send email notification
    try {
      const subject = 'Yeni Form Gönderimi - Classhopper';
      const projectsList = (data.projects || []).map((p: any, i: number) => 
        `<li><strong>Proje ${i + 1}:</strong> ${p.projectName} (${p.projectCategory})</li>`
      ).join('');
      const html = `
        <h2>Yeni Form Gönderimi</h2>
        <p><strong>Ad Soyad:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Üniversite:</strong> ${data.university}</p>
        <p><strong>Bölüm:</strong> ${data.department}</p>
        <p><strong>Klan:</strong> ${data.clanName}</p>
        <p><strong>Projeler:</strong></p>
        <ul>${projectsList}</ul>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject,
        html,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({ 
      success: true, 
      message: 'Form başarıyla gönderildi',
      id: submissionRef.id 
    });

  } catch (error: any) {
    console.error('Form submission error:', error);
    
    if (error.statusCode === 429) {
      res.status(429).json({ success: false, message: 'Çok fazla istek gönderildi. Lütfen bekleyin.' });
    } else {
      res.status(500).json({ success: false, message: 'Sunucu hatası oluştu' });
    }
  }
});

// Export HTTP function
export const api = functions.https.onRequest(app);

// Firestore triggers
export const onSubmissionCreate = functions.firestore
  .document('publicSubmissions/{submissionId}')
  .onCreate(async (snap, context) => {
    console.log('New submission created:', context.params.submissionId);
    
    // Additional processing can be added here
    return null;
  });

// Admin functions (require authentication)
export const approveSubmission = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and is admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { submissionId, action } = data;
  
  if (action === 'approve') {
    // Process the submission and create normalized records
    const submissionDoc = await db.collection('publicSubmissions').doc(submissionId).get();
    const submission = submissionDoc.data();
    
    if (!submission || submission.status !== 'pending') {
      throw new functions.https.HttpsError('failed-precondition', 'Invalid submission');
    }

    const payload = submission.payload;
    
    if (submission.type === 'form') {
      // Create student record
      const studentData = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: normalizePhoneNumber(payload.phone),
        university: payload.university,
        department: payload.department,
        classYear: payload.classYear,
        displayHandle: generateDisplayHandle(payload.firstName, payload.lastName),
        consentKVKK: payload.consentKVKK,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      const studentRef = await db.collection('students').add(studentData);
      
      // Create or update clan
      const clanQuery = await db.collection('clans').where('name', '==', payload.clanName).get();
      let clanRef;
      
      if (clanQuery.empty) {
        const clanData = {
          name: payload.clanName,
          stats: {
            memberCount: 1,
            projectCount: 0,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        clanRef = await db.collection('clans').add(clanData);
      } else {
        clanRef = clanQuery.docs[0].ref;
        await clanRef.update({
          'stats.memberCount': admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      
      // Create clan member record
      const clanMemberData = {
        studentId: studentRef.id,
        clanId: clanRef.id,
        role: payload.clanRole,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await db.collection('clanMembers').add(clanMemberData);
      
      // Create project records (loop through all projects)
      const projects = payload.projects || [];
      for (const project of projects) {
        const projectData = {
          name: project.projectName,
          summary: project.projectSummary,
          category: project.projectCategory,
          techTags: project.projectTechTags,
          status: project.projectStatus,
          ownerStudentId: studentRef.id,
          clanId: clanRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection('projects').add(projectData);
      }
      
      // Update clan project count
      await clanRef.update({
        'stats.projectCount': admin.firestore.FieldValue.increment(projects.length),
      });
    }
    
    // Update submission status
    await db.collection('publicSubmissions').doc(submissionId).update({
      status: 'ingested',
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Log admin action
    await db.collection('adminAudit').add({
      actorUid: context.auth.uid,
      action: 'approve_submission',
      target: { submissionId, type: submission.type },
      meta: { timestamp: Date.now() },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return { success: true, message: 'Submission approved successfully' };
    
  } else if (action === 'reject') {
    // Update submission status
    await db.collection('publicSubmissions').doc(submissionId).update({
      status: 'rejected',
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Log admin action
    await db.collection('adminAudit').add({
      actorUid: context.auth.uid,
      action: 'reject_submission',
      target: { submissionId },
      meta: { timestamp: Date.now() },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return { success: true, message: 'Submission rejected successfully' };
  }
  
  throw new functions.https.HttpsError('invalid-argument', 'Invalid action');
});
