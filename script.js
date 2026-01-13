document.addEventListener('DOMContentLoaded', () => {
    const openAppButton = document.getElementById('openAppButton');
    const statusMessage = document.getElementById('statusMessage');
    const debugInfo = document.getElementById('debugInfo');

    let md = new MobileDetect(window.navigator.userAgent);

    // --- Define your app's deep link and fallback URLs ---
    const APP_SCHEME = 'myawesomeapp://'; // iOS and Android scheme
    const ANDROID_PACKAGE_NAME = 'com.example.myawesomeapp'; // Your Android app's package name
    const ANDROID_FALLBACK_URL = 'https://play.google.com/store/apps/details?id=' + ANDROID_PACKAGE_NAME; // Link to Google Play Store
    const IOS_APP_STORE_ID = '123456789'; // Replace with your actual App Store ID
    const IOS_FALLBACK_URL = 'https://apps.apple.com/us/app/id' + IOS_APP_STORE_ID; // Link to Apple App Store

    let osType = "Unknown";
    let deepLinkUrl = "";
    let fallbackUrl = "";

    if (md.is('iOS')) {
        osType = "iOS";
        deepLinkUrl = APP_SCHEME + 'open'; // Example: myawesomeapp://open
        fallbackUrl = IOS_FALLBACK_URL;
        statusMessage.style.color = '#007bff'; // Blue for iOS
        statusMessage.textContent = `Detected OS: ${osType}. Using iOS deep link.`;
    } else if (md.is('AndroidOS')) {
        osType = "Android";
        // Android Intent URL structure:
        // intent://{host}{path}#Intent;scheme={scheme};package={package};action={action};category={category};component={component};end
        deepLinkUrl = `intent://open#Intent;scheme=${APP_SCHEME.replace('://', '')};package=${ANDROID_PACKAGE_NAME};end`;
        fallbackUrl = ANDROID_FALLBACK_URL;
        statusMessage.style.color = '#388E3C'; // Green for Android
        statusMessage.textContent = `Detected OS: ${osType}. Using Android Intent URL.`;
    } else {
        osType = "Desktop/Other";
        deepLinkUrl = 'javascript:void(0)'; // No deep link for desktop
        fallbackUrl = 'https://www.yourwebapp.com/download'; // Generic download page
        statusMessage.style.color = '#FBC02D'; // Yellow for others
        statusMessage.textContent = `Detected OS: ${osType}. Direct app deep linking is not typically supported on desktop.`;
        openAppButton.disabled = true;
        openAppButton.textContent = "Not available on desktop";
    }

    // Display debug info
    debugInfo.innerHTML = `
        <strong>User Agent:</strong> ${window.navigator.userAgent}<br>
        <strong>Detected OS:</strong> ${osType}<br>
        <strong>Deep Link URL:</strong> ${deepLinkUrl}<br>
        <strong>Fallback URL:</strong> ${fallbackUrl}
    `;

    openAppButton.addEventListener('click', () => {
        if (osType === "Desktop/Other") {
             // For desktop, maybe open the web app or a general download page
            window.open(fallbackUrl, '_blank');
            return;
        }

        // Try to open the deep link
        const start = Date.now();
        window.location.href = deepLinkUrl;

        // Fallback: If the app doesn't open within a certain time, redirect to the store.
        // This is a common heuristic, but not foolproof.
        // Modern browsers (especially iOS Safari) can block this kind of automatic redirect
        // if the deep link doesn't open the app.
        setTimeout(() => {
            if (Date.now() - start < 2000) { // If less than 2 seconds passed, app likely didn't open
                statusMessage.textContent = `App didn't open, redirecting to store...`;
                statusMessage.style.color = '#dc3545'; // Red for error
                window.location.href = fallbackUrl;
            } else {
                statusMessage.textContent = `App might have opened successfully!`;
                statusMessage.style.color = '#28a745'; // Green for success
            }
        }, 1500); // Wait 1.5 seconds

        // For iOS specifically, you might use window.open() to prevent history issues
        // if the deep link doesn't work, but it also has its own complexities.
        // For simplicity, we'll stick to window.location.href here.
        // If you use window.open for iOS, make sure to handle popup blockers.
    });
});