@echo off
echo =============================================
echo   PadelPro — Starting All Services
echo =============================================

echo.
echo [1/5] Starting Auth Service (port 5001)...
start "Auth Service" cmd /k "cd services\auth-service && npm run dev"
timeout /t 2 /nobreak >nul

echo [2/5] Starting User Service (port 5002)...
start "User Service" cmd /k "cd services\user-service && npm run dev"
timeout /t 2 /nobreak >nul

echo [3/5] Starting Tournament Service (port 5003)...
start "Tournament Service" cmd /k "cd services\tournament-service && npm run dev"
timeout /t 2 /nobreak >nul

echo [4/5] Starting Match Service (port 5004)...
start "Match Service" cmd /k "cd services\match-service && npm run dev"
timeout /t 2 /nobreak >nul

echo [5/5] Starting API Gateway (port 5000)...
start "API Gateway" cmd /k "cd services\api-gateway && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [6/6] Starting Frontend (port 3000)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =============================================
echo   All services started!
echo   Open: http://localhost:3000
echo =============================================
pause
