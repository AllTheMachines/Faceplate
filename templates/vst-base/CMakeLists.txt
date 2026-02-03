cmake_minimum_required(VERSION 3.22)

# ============================================
# Read plugin.config file
# ============================================
file(STRINGS "${CMAKE_CURRENT_SOURCE_DIR}/plugin.config" CONFIG_LINES)
foreach(LINE ${CONFIG_LINES})
    # Skip comments and empty lines
    if(LINE MATCHES "^#" OR LINE STREQUAL "")
        continue()
    endif()
    # Parse KEY=VALUE
    if(LINE MATCHES "^([^=]+)=(.*)$")
        set(${CMAKE_MATCH_1} "${CMAKE_MATCH_2}")
    endif()
endforeach()

# ============================================
# Project Setup
# ============================================
project(${PLUGIN_NAME} VERSION ${PLUGIN_VERSION})

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Use static runtime on MSVC
if(MSVC)
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
endif()

# ============================================
# Fetch WebView2 SDK for Windows
# ============================================
include(FetchContent)
FetchContent_Declare(
    webview2
    URL https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.2792.45
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
)
FetchContent_MakeAvailable(webview2)

# ============================================
# Add JUCE
# ============================================
add_subdirectory(JUCE)

# ============================================
# Plugin Target
# ============================================
juce_add_plugin(${PROJECT_NAME}
    COMPANY_NAME "${COMPANY_NAME}"
    COMPANY_WEBSITE "${COMPANY_WEBSITE}"
    COMPANY_EMAIL "${COMPANY_EMAIL}"
    IS_SYNTH ${IS_SYNTH}
    NEEDS_MIDI_INPUT ${NEEDS_MIDI_INPUT}
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE
    COPY_PLUGIN_AFTER_BUILD TRUE
    VST3_COPY_DIR "${VST3_INSTALL_DIR}"
    PLUGIN_MANUFACTURER_CODE ${MANUFACTURER_CODE}
    PLUGIN_CODE ${PLUGIN_CODE}
    FORMATS VST3
    PRODUCT_NAME "${PLUGIN_DISPLAY_NAME}"
    BUNDLE_ID "${BUNDLE_ID}"
    DESCRIPTION "${PLUGIN_DESCRIPTION}"
)

# ============================================
# Source Files
# ============================================
target_sources(${PROJECT_NAME}
    PRIVATE
        src/PluginProcessor.cpp
        src/PluginEditor.cpp
)

# ============================================
# Embed UI Files
# ============================================
juce_add_binary_data(${PROJECT_NAME}_BinaryData
    SOURCES
        ui/index.html
        ui/style.css
        ui/components.js
        ui/bindings.js
)

# ============================================
# WebView2 Configuration
# ============================================
target_include_directories(${PROJECT_NAME}
    PRIVATE
        "${webview2_SOURCE_DIR}/build/native/include"
)

# ============================================
# Compile Definitions
# ============================================
target_compile_definitions(${PROJECT_NAME}
    PUBLIC
        JUCE_WEB_BROWSER=1
        JUCE_USE_WIN_WEBVIEW2_WITH_STATIC_LINKING=1
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
)

# Pass config values to C++
target_compile_definitions(${PROJECT_NAME}
    PRIVATE
        PLUGIN_COPYRIGHT="${COPYRIGHT_TEXT}"
        PLUGIN_WINDOW_WIDTH=${WINDOW_WIDTH}
        PLUGIN_WINDOW_HEIGHT=${WINDOW_HEIGHT}
)

# ============================================
# Link Libraries
# ============================================
if(CMAKE_SIZEOF_VOID_P EQUAL 8)
    set(WEBVIEW2_ARCH "x64")
else()
    set(WEBVIEW2_ARCH "x86")
endif()

target_link_libraries(${PROJECT_NAME}
    PRIVATE
        ${PROJECT_NAME}_BinaryData
        juce::juce_audio_utils
        juce::juce_gui_extra
        "${webview2_SOURCE_DIR}/build/native/${WEBVIEW2_ARCH}/WebView2LoaderStatic.lib"
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

# ============================================
# Print Configuration Summary
# ============================================
message(STATUS "")
message(STATUS "=== Plugin Configuration ===")
message(STATUS "Name: ${PLUGIN_DISPLAY_NAME}")
message(STATUS "Version: ${PLUGIN_VERSION}")
message(STATUS "Type: ${IS_SYNTH}")
message(STATUS "Company: ${COMPANY_NAME}")
message(STATUS "Plugin Code: ${PLUGIN_CODE}")
message(STATUS "Install Dir: ${VST3_INSTALL_DIR}")
message(STATUS "============================")
message(STATUS "")
