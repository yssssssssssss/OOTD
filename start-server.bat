@echo off
echo 正在安装后端依赖...
npm install express cors

echo.
echo 正在启动后端API服务器...
echo 服务器将运行在 http://localhost:3001
echo 按 Ctrl+C 停止服务器
echo.

node server.js

pause