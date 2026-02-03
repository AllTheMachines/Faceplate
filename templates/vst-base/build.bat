@echo off
if not exist build mkdir build
pushd build
cmake ..
cmake --build . --config Release
popd
powershell -c "[console]::beep(300, 150)"
