# 数据库迁移指南

## 当前状态

项目目前使用**本地模拟数据**，数据存储在浏览器的本地存储中。这种方式适合开发和测试，但不适合生产环境。

## 架构设计

项目采用了**适配器模式**，可以轻松在不同的数据库解决方案之间切换：

```
Store (全局状态管理)
    ↓
DatabaseAdapter (接口)
    ↓
MockDatabaseAdapter | SupabaseAdapter
```

## 当前功能

### ✅ 已实现的功能

1. **用户管理**
   - 用户信息存储和获取
   - 用户数据更新

2. **角色管理**
   - 创建角色
   - 获取用户的角色列表
   - 角色数据持久化

3. **图片处理**
   - 默认头像生成
   - 模拟图片上传
   - 图片URL管理

4. **数据持久化**
   - 本地存储自动保存
   - 数据导入导出功能

### 🔧 技术特性

- **类型安全**: 完整的TypeScript类型定义
- **响应式数据**: Vue 3 响应式系统
- **错误处理**: 完善的错误捕获和用户提示
- **加载状态**: 用户友好的加载提示

## 报错分析

你提到的报错主要是以下几个问题：

### 1. TypeScript类型推断问题
**问题**: `v-for="character in store.characters"` 中类型推断失败
**解决**: 已修复为 `v-for="character in (store.characters as Character[])"`

### 2. 图片URL问题
**问题**: 默认头像路径错误
**解决**: 
- 创建了 `/static/default-avatar.svg` 默认头像
- 修复了图片路径引用
- 添加了动态头像生成功能

### 3. 数据库查询功能
**当前状态**: 使用模拟数据库，支持完整的CRUD操作
**将来**: 可以无缝迁移到Supabase

## 迁移到Supabase

### 第一步：准备工作

1. **安装依赖**
```bash
npm install @supabase/supabase-js
```

2. **创建Supabase项目**
   - 访问 [supabase.com](https://supabase.com)
   - 创建新项目
   - 获取项目URL和API密钥

### 第二步：数据库设置

在Supabase SQL编辑器中执行以下SQL：

```sql
-- 用户表
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色表
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  image_url TEXT,
  hair_style VARCHAR(50),
  hair_color VARCHAR(50),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全性
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- 安全策略
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own characters" ON characters
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can insert own characters" ON characters
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update own characters" ON characters
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete own characters" ON characters
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE user_id = auth.uid()::text));
```

### 第三步：配置代码

1. **更新配置文件** (`src/config/database.ts`)
```typescript
// 将数据库类型改为 supabase
export const DATABASE_TYPE: DatabaseType = 'supabase'
```

2. **配置Supabase连接** (`src/utils/supabaseAdapter.ts`)
```typescript
export const supabaseConfig: SupabaseConfig = {
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
  tableName: {
    users: 'users',
    characters: 'characters'
  }
}
```

3. **取消注释Supabase代码**
   - 在 `supabaseAdapter.ts` 中取消注释所有Supabase相关代码
   - 取消注释导入语句

### 第四步：数据迁移

1. **导出现有数据**
```typescript
import { DataMigrationTool } from '@/config/database'

// 导出当前数据
const exportedData = await DataMigrationTool.exportMockData()
console.log(exportedData) // 复制这些数据
```

2. **手动导入到Supabase**
   - 将导出的数据手动插入到Supabase表中
   - 或者编写迁移脚本

### 第五步：测试

1. **功能测试**
   - 用户登录/注册
   - 角色创建和管理
   - 图片上传

2. **性能测试**
   - 网络请求响应时间
   - 数据同步效果

## 当前建议

### 短期（继续使用Mock数据）

1. **优点**
   - 开发速度快
   - 无需网络连接
   - 数据完全可控
   - 无额外成本

2. **适用场景**
   - 原型开发
   - 功能测试
   - 离线演示

### 长期（迁移到Supabase）

1. **优点**
   - 真实的数据库功能
   - 实时数据同步
   - 用户认证集成
   - 文件存储服务
   - 自动备份

2. **适用场景**
   - 生产环境
   - 多用户应用
   - 需要数据持久化

## 文件结构

```
src/
├── config/
│   └── database.ts          # 数据库配置和切换
├── utils/
│   ├── mockData.ts          # 模拟数据和Mock适配器
│   └── supabaseAdapter.ts   # Supabase适配器（待启用）
├── store/
│   └── index.ts             # 全局状态管理
└── pages/
    ├── profile/             # 用户主页
    └── create-character/    # 创建角色页面
```

## 常见问题

### Q: 现在的Mock数据会丢失吗？
A: 不会，数据保存在浏览器本地存储中，除非手动清除。

### Q: 如何备份当前数据？
A: 使用 `DataMigrationTool.exportMockData()` 导出JSON格式的数据。

### Q: 迁移到Supabase需要多长时间？
A: 如果按照指南操作，大约1-2小时可以完成基本迁移。

### Q: 可以同时支持两种数据库吗？
A: 可以，通过修改 `DATABASE_TYPE` 配置即可切换。

## 总结

当前的实现已经为Supabase迁移做好了充分准备：

1. ✅ **架构设计合理** - 适配器模式便于切换
2. ✅ **类型定义完整** - TypeScript确保类型安全
3. ✅ **功能实现完整** - 所有CRUD操作都已实现
4. ✅ **错误处理完善** - 用户体验良好
5. ✅ **迁移工具就绪** - 数据导入导出功能

你可以继续使用Mock数据进行开发，等需要部署到生产环境时再迁移到Supabase。整个迁移过程是无缝的，不需要修改业务逻辑代码。