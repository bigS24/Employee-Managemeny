import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Permission {
    id: number
    page_key: string
    action_type: string
    display_name: string
}

interface PermissionEditorProps {
    isOpen: boolean
    onClose: () => void
    user: {
        id: number
        username: string
        is_admin: boolean
    } | null
    onSuccess: () => void
}

export function PermissionEditor({ isOpen, onClose, user, onSuccess }: PermissionEditorProps) {
    const [allPermissions, setAllPermissions] = useState<Permission[]>([])
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isOpen && user) {
            loadPermissions()
        }
    }, [isOpen, user])

    const loadPermissions = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            // Load all available permissions
            const all = await window.api.permissions.list()
            setAllPermissions(all || [])

            // Load user's current permissions
            const userPerms = await window.api.permissions.getUserPermissions(user.id)
            setSelectedPermissions((userPerms || []).map((p: Permission) => p.id))
        } catch (error) {
            console.error('Failed to load permissions:', error)
            toast.error('فشل تحميل الصلاحيات')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!user) return

        setIsSaving(true)
        try {
            const result = await window.api.permissions.setUserPermissions(user.id, selectedPermissions)

            if (result.success) {
                toast.success('تم حفظ الصلاحيات بنجاح')
                onSuccess()
                onClose()
            } else {
                toast.error(result.error || 'فشل حفظ الصلاحيات')
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء حفظ الصلاحيات')
        } finally {
            setIsSaving(false)
        }
    }

    const togglePermission = (permissionId: number) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        )
    }

    const toggleAllForPage = (pageKey: string) => {
        const pagePermissions = allPermissions.filter(p => p.page_key === pageKey)
        const pagePermissionIds = pagePermissions.map(p => p.id)
        const allSelected = pagePermissionIds.every(id => selectedPermissions.includes(id))

        if (allSelected) {
            // Deselect all for this page
            setSelectedPermissions(prev => prev.filter(id => !pagePermissionIds.includes(id)))
        } else {
            // Select all for this page
            setSelectedPermissions(prev => [...new Set([...prev, ...pagePermissionIds])])
        }
    }

    if (!isOpen || !user) return null

    // Group permissions by page
    const groupedPermissions = allPermissions.reduce((acc, perm) => {
        if (!acc[perm.page_key]) {
            acc[perm.page_key] = []
        }
        acc[perm.page_key].push(perm)
        return {}
    }, {} as Record<string, Permission[]>)

    const pages = [...new Set(allPermissions.map(p => p.page_key))]

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] shadow-xl border border-border flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">
                        إدارة صلاحيات: {user.username}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : user.is_admin ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                المديرون لديهم جميع الصلاحيات تلقائياً
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {pages.map(pageKey => {
                                const pagePerms = allPermissions.filter(p => p.page_key === pageKey)
                                const allSelected = pagePerms.every(p => selectedPermissions.includes(p.id))
                                const someSelected = pagePerms.some(p => selectedPermissions.includes(p.id))

                                return (
                                    <div key={pageKey} className="border border-border rounded-lg p-4">
                                        {/* Page Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <button
                                                onClick={() => toggleAllForPage(pageKey)}
                                                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                                            >
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${allSelected ? 'bg-primary border-primary' : someSelected ? 'bg-primary/50 border-primary' : 'border-border'
                                                    }`}>
                                                    {allSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span>{pageKey}</span>
                                            </button>
                                        </div>

                                        {/* Permissions Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {pagePerms.map(perm => (
                                                <label
                                                    key={perm.id}
                                                    className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions.includes(perm.id)}
                                                        onChange={() => togglePermission(perm.id)}
                                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-foreground">{perm.display_name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!user.is_admin && (
                    <div className="flex gap-3 p-6 border-t border-border">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1"
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="flex-1"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                'حفظ الصلاحيات'
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
