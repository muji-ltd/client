@echo off
title Discord Bot Client - Setup
color 0a
echo.
echo 1. Install
echo 2. Start
echo.

set /p a=
IF %a%==1 goto installer
IF %a%==2 goto start

:installer
npm install
:start
npm start