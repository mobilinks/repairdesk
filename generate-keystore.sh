#!/bin/bash

# Generate a keystore file for signing the APK
keytool -genkeypair -v -keystore repairdesk-keystore.jks -alias repairdesk -keyalg RSA -keysize 2048 -validity 10000 -storetype JKS

# Instructions for the user
echo "Keystore generated successfully!"
echo "Keep this file safe - you'll need it for all future app updates."
echo "Remember your keystore password and alias password."

