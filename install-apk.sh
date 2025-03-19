#!/bin/bash

# Check if ADB is installed
if ! command -v adb &> /dev/null; then
    echo "Error: ADB (Android Debug Bridge) is not installed or not in PATH"
    echo "Please install Android SDK Platform Tools"
    exit 1
fi

# Check if device is connected
DEVICES=$(adb devices | grep -v "List" | grep "device")
if [ -z "$DEVICES" ]; then
    echo "Error: No Android device connected"
    echo "Please connect your device and enable USB debugging"
    exit 1
fi

# Check if APK file is provided
if [ -z "$1" ]; then
    echo "Error: No APK file specified"
    echo "Usage: ./install-apk.sh path/to/your-app.apk"
    exit 1
fi

# Install the APK
echo "Installing APK to connected device..."
adb install -r "$1"

if [ $? -eq 0 ]; then
    echo "APK installed successfully!"
    echo "You can now open the RepairDesk app on your device"
else
    echo "Error: Failed to install APK"
    echo "Please check that the APK file exists and is valid"
fi

