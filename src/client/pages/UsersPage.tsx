import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/components/Notifications'
import { useTranslation } from 'react-i18next'

const UsersPage = () => {
  const { users, isLoading, error, fetchUsers, selectUser, selectedUser, deleteUser } = useUserStore()
  const { showSuccess, showError } = useNotifications()
  const { t } = useTranslation('users')

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSelectUser = (userId: number) => {
    selectUser(userId)
    showSuccess(t('notifications.userSelected.message'), { title: t('notifications.userSelected.title') })
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId)
      showSuccess(t('notifications.userDeleted.message'), { title: t('notifications.userDeleted.title') })
    } catch (error) {
      showError(t('notifications.deleteError.message'), {
        title: t('notifications.deleteError.title'),
        duration: 8000 // 显示更长时间
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('userList')}</h2>
        <Button onClick={() => fetchUsers()} disabled={isLoading}>
          {isLoading ? t('loading') : t('refresh')}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <Card key={user.id} className={selectedUser?.id === user.id ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('user.id')}: {user.id}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleSelectUser(user.id)}
                disabled={selectedUser?.id === user.id}
              >
                {selectedUser?.id === user.id ? t('actions.selected') : t('actions.select')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteUser(user.id)}
              >
                {t('actions.delete')}
              </Button>
            </CardFooter>
          </Card>
        ))}

        {users.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-10 bg-muted rounded-lg">
            <p className="text-muted-foreground">{t('noUsers')}</p>
          </div>
        )}

        {isLoading && (
          <div className="col-span-full text-center py-10 bg-muted rounded-lg">
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t('selectedUser.title')}</CardTitle>
            <CardDescription>{t('selectedUser.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>{t('selectedUser.id')}:</strong> {selectedUser.id}</p>
              <p><strong>{t('selectedUser.name')}:</strong> {selectedUser.name}</p>
              <p><strong>{t('selectedUser.email')}:</strong> {selectedUser.email}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UsersPage
