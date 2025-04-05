import { Context } from 'hono'
import { getCookie } from 'hono/cookie'

// 语言消息
export const messages = {
  'zh-CN': {
    hello: '你好，这是来自 Hono API 的消息！',
    userNotFound: '用户不存在',
    userDeleted: '用户已删除',
    nameMinLength: '名称至少需要 2 个字符',
    invalidEmail: '请提供有效的电子邮件地址',
    userCreated: '用户创建成功',
    userUpdated: '用户更新成功',
    loginSuccess: '登录成功',
    loginFailed: '登录失败，邮箱或密码错误',
    accountDisabled: '账户已禁用，请联系管理员',
    registerSuccess: '注册成功，请等待管理员激活账户',
    registrationFailed: '注册失败',
    registrationDisabled: '模板项目暂不支持公开注册，请使用管理员密钥注册',
    accountActivated: '账户已激活',
    accountDeactivated: '账户已禁用',
    unauthorized: '未授权操作',
    adminRequired: '需要管理员权限',
    emailExists: '邮箱已存在',
    emailInUse: '邮箱已被其他用户使用',
    lastAdmin: '无法删除最后一个管理员',
    fetchUsersFailed: '获取用户列表失败',
    fetchUserFailed: '获取用户信息失败',
    createUserFailed: '创建用户失败',
    updateUserFailed: '更新用户失败',
    deleteUserFailed: '删除用户失败',
    activateUserFailed: '激活用户失败',
    deactivateUserFailed: '禁用用户失败',
    notYourAccount: '您只能更新自己的账户信息'
  },
  'en': {
    hello: 'Hello, this is a message from the Hono API!',
    userNotFound: 'User not found',
    userDeleted: 'User deleted',
    nameMinLength: 'Name must be at least 2 characters',
    invalidEmail: 'Please provide a valid email address',
    userCreated: 'User created successfully',
    userUpdated: 'User updated successfully',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed, incorrect email or password',
    accountDisabled: 'Account is disabled, please contact administrator',
    registerSuccess: 'Registration successful, please wait for admin activation',
    registrationFailed: 'Registration failed',
    registrationDisabled: 'Public registration is currently disabled in this template project. Please use an admin key to register.',
    accountActivated: 'Account activated',
    accountDeactivated: 'Account deactivated',
    unauthorized: 'Unauthorized operation',
    adminRequired: 'Admin privileges required',
    emailExists: 'Email already exists',
    emailInUse: 'Email already in use by another user',
    lastAdmin: 'Cannot delete the last admin user',
    fetchUsersFailed: 'Failed to fetch users',
    fetchUserFailed: 'Failed to fetch user',
    createUserFailed: 'Failed to create user',
    updateUserFailed: 'Failed to update user',
    deleteUserFailed: 'Failed to delete user',
    activateUserFailed: 'Failed to activate user',
    deactivateUserFailed: 'Failed to deactivate user',
    notYourAccount: 'You can only update your own account information'
  }
}

// 获取语言中间件
export const getLanguage = (c: Context) => {
  // 从 cookie 中获取语言设置
  const lang = getCookie(c, 'i18nextLng') || 'zh-CN'
  console.log('Current language from cookie:', lang)
  // 只支持 zh-CN 和 en
  return lang === 'en' ? 'en' : 'zh-CN'
}
