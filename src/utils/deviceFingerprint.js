/* ============================================================
   deviceFingerprint.js
   Generates a unique device fingerprint for tracking sessions
   ============================================================ */

export const getDeviceFingerprint = async () => {
  const components = [];
  
  // 1. User Agent
  components.push(navigator.userAgent);
  
  // 2. Screen resolution
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  
  // 3. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // 4. Language
  components.push(navigator.language);
  
  // 5. Platform
  components.push(navigator.platform);
  
  // 6. Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency || 'unknown');
  
  // 7. Device memory (if available)
  components.push(navigator.deviceMemory || 'unknown');
  
  // 8. Touch support
  components.push('ontouchstart' in window);
  
  // 9. WebGL vendor (async)
  let webglVendor = 'unknown';
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      webglVendor = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
  }
  components.push(webglVendor);
  
  // Generate hash from components
  const fingerprintString = components.join('|');
  const hash = await sha256(fingerprintString);
  
  return {
    fingerprint: hash.substring(0, 32), // Shortened hash
    components: {
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cores: navigator.hardwareConcurrency,
      memory: navigator.deviceMemory,
      touchSupport: 'ontouchstart' in window,
      webglVendor: webglVendor,
    }
  };
};

// Simple SHA-256 implementation
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}