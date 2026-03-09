// app/layout.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import AuthProvider from '@/providers/AuthProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgTech Soil Monitoring Dashboard',
  description: 'Real-time soil health monitoring and analytics platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Suspense fallback={<LoadingSpinner />}>
                {children}
              </Suspense>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

// app/page.tsx (Home/Landing page)
export default function HomePage() {
  return (
    <div className="prose max-w-none">
      <h1>Welcome to Soil Health Monitoring</h1>
      {/* Landing page content */}
    </div>
  );
}

// app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto">
      {/* Login form component */}
    </div>
  );
}

// app/(auth)/register/page.tsx
export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto">
      {/* Register form component */}
    </div>
  );
}

// app/soil-metrics/page.tsx
export default function SoilMetricsPage() {
  return (
    <div>
      {/* Soil metrics list component */}
    </div>
  );
}

// app/soil-metrics/[id]/page.tsx
export default function SoilMetricDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      {/* Soil metric detail component */}
    </div>
  );
}

// app/soil-metrics/create/page.tsx
export default function CreateSoilMetricPage() {
  return (
    <div>
      {/* Create soil metric form */}
    </div>
  );
}

// app/soil-metrics/[id]/edit/page.tsx
export default function EditSoilMetricPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      {/* Edit soil metric form */}
    </div>
  );
}

// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      {/* Not found content */}
    </div>
  );
}

// middleware.ts (Route protection)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register'];
  
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await verifyAuth(token.value);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/soil-metrics/:path*',
    '/dashboard/:path*',
    // Add other protected routes
  ],
};