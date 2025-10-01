import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { firestoreService } from '@/lib/firestore';

// Proje şeması
const projectSchema = z.object({
  projectName: z.string().min(2).max(200),
  projectSummary: z.string().min(10).max(1000),
  projectCategory: z.enum(['software', 'robotics', 'design', 'ai', 'mobile', 'web', 'other']),
  projectTechTags: z.array(z.string().max(50)).min(1).max(10),
  projectStatus: z.enum(['idea', 'active', 'completed', 'paused']),
});

const formSchema = z.object({
  // Kişisel Bilgiler
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^(\+90|0)?[5][0-9]{9}$/),
  university: z.string().min(2).max(100),
  department: z.string().min(2).max(100),
  classYear: z.string().min(1),
  
  // Klan Bilgileri
  clanName: z.string().min(2).max(100),
  clanRole: z.enum(['leader', 'member']),
  
  // Proje Bilgileri (artık array)
  projects: z.array(projectSchema).min(1).max(5),
  
  // Onay
  consentKVKK: z.boolean().refine(val => val === true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = formSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: result.error.errors[0].message,
        },
        { status: 400 }
      );
    }
    
    const formData = result.data;
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Firestore'a kaydet
    const saveResult = await firestoreService.saveSubmission({
      ...formData,
      ipAddress: clientIP,
      userAgent: userAgent,
    });

    if (!saveResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Veri kaydedilirken hata oluştu.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bilgileriniz başarıyla kaydedildi!',
      data: {
        id: saveResult.id,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      },
      { status: 500 }
    );
  }
}