import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: ReactNode
    requireAdmin?: boolean
    pageKey?: string
}

export function ProtectedRoute({ children, requireAdmin = false, pageKey }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user, can } = useAuthStore()
    const location = useLocation()

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">جاري التحميل...</p>
                </div>
            </div>
        )
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check admin requirement
    if (requireAdmin && !user.is_admin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center max-w-md">
                    <div className="bg-destructive/10 text-destructive rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        غير مصرح
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        هذه الصفحة متاحة للمديرين فقط
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="text-primary hover:underline"
                    >
                        العودة
                    </button>
                </div>
            </div>
        )
    }

    // Check page permission
    if (pageKey && !can(pageKey, 'view')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="text-center max-w-md">
                    <div className="bg-destructive/10 text-destructive rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⛔</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        غير مصرح
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        ليس لديك صلاحية للوصول إلى هذه الصفحة
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="text-primary hover:underline"
                    >
                        العودة
                    </button>
                </div>
            </div>
        )
    }

    // Authorized - render children
    return <>{children}</>
}
