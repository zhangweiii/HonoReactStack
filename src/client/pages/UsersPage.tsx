import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/components/Notifications'

const UsersPage = () => {
  const { users, isLoading, error, fetchUsers, selectUser, selectedUser, deleteUser } = useUserStore()
  const { showSuccess, showError } = useNotifications()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSelectUser = (userId: number) => {
    selectUser(userId)
    showSuccess('用户已选中', { title: '成功' })
  }

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId)
      showSuccess('用户已删除', { title: '成功' })
    } catch (error) {
      showError('删除用户失败', { 
        title: '错误',
        duration: 8000 // 显示更长时间
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">用户管理</h1>
      <p className="text-muted-foreground">这个页面展示了如何使用 Zustand store 来管理用户数据。</p>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">用户列表</h2>
        <Button onClick={() => fetchUsers()} disabled={isLoading}>
          {isLoading ? '加载中...' : '刷新用户'}
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
              <p>用户 ID: {user.id}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => handleSelectUser(user.id)}
                disabled={selectedUser?.id === user.id}
              >
                {selectedUser?.id === user.id ? '已选中' : '选择'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteUser(user.id)}
              >
                删除
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {users.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-10 bg-muted rounded-lg">
            <p className="text-muted-foreground">暂无用户数据</p>
          </div>
        )}
        
        {isLoading && (
          <div className="col-span-full text-center py-10 bg-muted rounded-lg">
            <p className="text-muted-foreground">加载中...</p>
          </div>
        )}
      </div>
      
      {selectedUser && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>已选中的用户</CardTitle>
            <CardDescription>当前选中的用户详情</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>姓名:</strong> {selectedUser.name}</p>
              <p><strong>邮箱:</strong> {selectedUser.email}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UsersPage
