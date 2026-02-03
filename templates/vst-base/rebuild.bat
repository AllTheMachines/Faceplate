@echo off
git pull
if exist build rmdir /s /q build
mkdir build
pushd build
cmake ..
cmake --build . --config Release
popd
powershell -c "[console]::beep(300, 150)"
