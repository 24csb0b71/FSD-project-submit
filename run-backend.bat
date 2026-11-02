@echo off
set "JAVA_HOME=S:\Programs\Minecraft\runtime\java-runtime-delta\windows\java-runtime-delta"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd backend
echo Starting Spring Boot DigiVote Backend on http://localhost:8080 ...
call .\mvnw.cmd spring-boot:run
pause
