// Supabase配置文件
// 请在Supabase项目设置中获取以下配置信息

export const supabaseConfig = {
  // 项目URL - 在Supabase项目设置 > API > Project URL中找到
  url: 'https://zggcpsevulwgfaguotqo.supabase.co', // 例如: 'https://your-project-id.supabase.co'

  // 匿名公钥 - 在Supabase项目设置 > API > Project API keys > anon public中找到
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZ2Nwc2V2dWx3Z2ZhZ3VvdHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzMzOTgsImV4cCI6MjA3NDIwOTM5OH0.YJB2tIYXrdv_20vVOCQZ3wYjatgZxrHxH4JrBbQIIxw'
}

// 使用说明：
// 1. 登录到你的Supabase项目
// 2. 进入项目设置 (Settings)
// 3. 点击 API 选项卡
// 4. 复制 Project URL 替换上面的 YOUR_SUPABASE_URL
// 5. 复制 anon public key 替换上面的 YOUR_SUPABASE_ANON_KEY
// 6. 确保你的数据库中已经创建了 users 表和 user_avatars 表

// 数据库表结构说明：
// users 表字段：
// - user_id (UUID, 主键)
// - user_name (TEXT, 用户名，对应页面中的账号)
// - user_code (TEXT, 用户密码，对应页面中的密码)
// - user_score (INTEGER, 用户积分，默认0)
// - create_time (TIMESTAMPTZ, 创建时间)

// user_avatars 表字段：
// - avatar_id (UUID, 主键)
// - user_id (UUID, 外键，关联users表)
// - avant_name (TEXT, 头像名称)
// - avant_url (TEXT, 头像URL)
// - created_at (TIMESTAMPTZ, 创建时间)