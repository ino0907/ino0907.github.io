@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto nonode
if exist .env goto run
echo Anthropic の API キー (sk-ant-...) を貼り付けて Enter を押してください。
echo キーなしで進める場合は、そのまま Enter を押します (AI 判定はランダムになります)。
set /p KEY=API キー: 
if "%KEY%"=="" goto run
>.env echo ANTHROPIC_API_KEY=%KEY%
:run
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3000"
node server.js
pause
exit /b 0
:nonode
echo Node.js が見つかりません。https://nodejs.org から LTS 版をインストールしてください。
pause
exit /b 1
