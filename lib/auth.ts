import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_session');
  return adminCookie?.value === 'authenticated';
}

export async function loginAdmin(password: string): Promise<{ success: boolean; message: string }> {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, message: '密码错误' };
  }

  const response = NextResponse.json({ success: true, message: '登录成功' });
  response.cookies.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true, message: '登录成功' };
}

export async function logoutAdmin(): Promise<void> {
  const response = NextResponse.json({ success: true, message: '已退出' });
  response.cookies.delete('admin_session');
}