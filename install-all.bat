@echo off
echo =============================================
echo   PadelPro — Installing All Dependencies
echo =============================================

echo.
echo Installing API Gateway dependencies...
cd services\api-gateway && npm install && cd ..\..

echo Installing Auth Service dependencies...
cd services\auth-service && npm install && cd ..\..

echo Installing User Service dependencies...
cd services\user-service && npm install && cd ..\..

echo Installing Tournament Service dependencies...
cd services\tournament-service && npm install && cd ..\..

echo Installing Match Service dependencies...
cd services\match-service && npm install && cd ..\..

echo Installing Test dependencies...
cd tests && npm install && cd ..

echo Installing Frontend dependencies...
cd frontend && npm install && cd ..

echo.
echo =============================================
echo   All dependencies installed!
echo   Next: Run seed.bat to load demo data,
echo         then start-all.bat to launch.
echo =============================================
pause
