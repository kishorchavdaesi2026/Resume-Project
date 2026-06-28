/**
 * ResumeIQ - Core Javascript & 3D WebGL Engine
 * Author: Antigravity
 * Tech Stack: Three.js, Canvas Textures, Custom Particle Physics, Parallax
 */

document.addEventListener('DOMContentLoaded', () => {
  initFormInteractions();
  initThreeDScene();
});

/* =========================================================================
   1. FORM INTERACTIONS & MICRO-INTERACTIONS
   ========================================================================= */
function initFormInteractions() {
  const loginForm = document.getElementById('login-form');
  const btnSubmit = document.getElementById('btn-submit');
  const btnText = btnSubmit.querySelector('.btn-text');
  const inputs = document.querySelectorAll('.input-field');
  const socialBtns = document.querySelectorAll('.btn-social');

  // Input wrapper focus states (additional styling fallback)
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.input-wrapper').classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.input-wrapper').classList.remove('focused');
    });
  });

  // Social login buttons click animation
  socialBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const provider = btn.id === 'btn-google' ? 'Google' : 'LinkedIn';
      
      // Visual feedback
      btn.style.transform = 'scale(0.97)';
      btn.style.borderColor = 'var(--cyan)';
      btn.style.background = 'rgba(103, 232, 249, 0.05)';
      
      setTimeout(() => {
        btn.style.transform = '';
        btn.style.borderColor = '';
        btn.style.background = '';
        showNotification(`Connecting with ${provider}...`);
      }, 150);
    });
  });

  // Form submit simulation
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Disable inputs and button
    inputs.forEach(input => input.disabled = true);
    btnSubmit.disabled = true;
    
    // Change button text to loading state
    const originalText = btnText.textContent;
    btnText.innerHTML = '<span class="loading-spinner"></span> Authenticating...';
    btnSubmit.style.boxShadow = '0 0 25px rgba(103, 232, 249, 0.4)';
    
    // Simulate API verification
    setTimeout(() => {
      // Re-enable and reset
      inputs.forEach(input => input.disabled = false);
      btnSubmit.disabled = false;
      btnText.textContent = originalText;
      btnSubmit.style.boxShadow = '';
      
      const emailVal = document.getElementById('email').value;
      showNotification(`Welcome back! Authenticated as ${emailVal}`, 'success');
      loginForm.reset();
    }, 2000);
  });

  // Custom Toast Notification System
  function showNotification(message, type = 'info') {
    // Remove existing notifications first
    const existing = document.querySelectorAll('.toast-notification');
    existing.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
      <svg class="toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('visible');
    }, 50);

    // Animate out
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // Inject CSS rules for the spinner and notification
  const style = document.createElement('style');
  style.textContent = `
    .loading-spinner {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .toast-notification {
      position: fixed;
      bottom: 24px;
      left: 24px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--white);
      font-size: 0.85rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 999;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-notification.visible {
      transform: translateY(0);
      opacity: 1;
    }
    .toast-notification.success {
      border-color: rgba(167, 243, 208, 0.3);
      background: rgba(6, 78, 59, 0.85);
      color: #D1FAE5;
    }
    .toast-icon {
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

/* =========================================================================
   2. THREE.JS 3D HERO SECTION (60% PANEL)
   ========================================================================= */
function initThreeDScene() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  let width = container.clientWidth;
  let height = container.clientHeight;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
  camera.position.set(0, 1.2, 5.8);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Responsive Resize
  window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // Mouse Parallax Targets
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  
  window.addEventListener('mousemove', (e) => {
    // Normalize coordinates from -1 to 1
    targetX = (e.clientX / window.innerWidth) * 2 - 1;
    targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  /* --------------------------------------------------
   * Dynamic Canvas Textures for Premium Look
   * -------------------------------------------------- */

  // Helper to generate glowing canvas icons
  function createIconTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // 1. Frosted Glass Circle Base
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.fill();

    // 2. Shiny Border Ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. Draw Icons
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;

    if (type === 'github') {
      ctx.shadowColor = '#67E8F9';
      ctx.fillStyle = '#67E8F9';
      // GitHub Silhouette Simplified (Cat body and head with ears)
      ctx.beginPath();
      ctx.arc(128, 134, 45, 0, Math.PI * 2); // main head
      ctx.fill();
      // Ears
      ctx.beginPath();
      ctx.moveTo(96, 96);
      ctx.lineTo(84, 66);
      ctx.lineTo(112, 84);
      ctx.closePath();
      ctx.moveTo(160, 96);
      ctx.lineTo(172, 66);
      ctx.lineTo(144, 84);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'linkedin') {
      ctx.shadowColor = '#2563EB';
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.roundRect(78, 78, 100, 100, 16);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.font = 'bold 70px Inter, sans-serif';
      ctx.fillText('in', 104, 148);
    } else if (type === 'pdf') {
      ctx.shadowColor = '#7DD3FC';
      ctx.strokeStyle = '#7DD3FC';
      // Document Sheet with fold
      ctx.beginPath();
      ctx.moveTo(88, 70);
      ctx.lineTo(140, 70);
      ctx.lineTo(168, 98);
      ctx.lineTo(168, 186);
      ctx.lineTo(88, 186);
      ctx.closePath();
      ctx.stroke();
      // Fold
      ctx.beginPath();
      ctx.moveTo(140, 70);
      ctx.lineTo(140, 98);
      ctx.lineTo(168, 98);
      ctx.stroke();
      // Text lines
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(104, 120); ctx.lineTo(152, 120);
      ctx.moveTo(104, 140); ctx.lineTo(152, 140);
      ctx.moveTo(104, 160); ctx.lineTo(132, 160);
      ctx.stroke();
    } else if (type === 'ats') {
      ctx.shadowColor = '#A7F3D0';
      ctx.strokeStyle = '#A7F3D0';
      // Shield Badge
      ctx.beginPath();
      ctx.moveTo(128, 65);
      ctx.quadraticCurveTo(168, 70, 178, 110);
      ctx.quadraticCurveTo(178, 155, 128, 195);
      ctx.quadraticCurveTo(78, 155, 78, 110);
      ctx.quadraticCurveTo(88, 70, 128, 65);
      ctx.closePath();
      ctx.stroke();
      // Checkmark inside shield
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(106, 124);
      ctx.lineTo(122, 142);
      ctx.lineTo(152, 108);
      ctx.stroke();
    } else if (type === 'analytics') {
      ctx.shadowColor = '#67E8F9';
      ctx.fillStyle = '#67E8F9';
      // 3 Dynamic Bars
      ctx.beginPath();
      ctx.roundRect(85, 130, 20, 50, 4);
      ctx.roundRect(118, 95, 20, 85, 4);
      ctx.roundRect(151, 75, 20, 105, 4);
      ctx.fill();
    } else if (type === 'ai') {
      ctx.shadowColor = '#A7F3D0';
      ctx.fillStyle = '#A7F3D0';
      // Multi sparkle
      function drawSparkle(cx, cy, r) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.quadraticCurveTo(cx, cy, cx + r, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy + r);
        ctx.quadraticCurveTo(cx, cy, cx - r, cy);
        ctx.quadraticCurveTo(cx, cy, cx, cy - r);
        ctx.closePath();
        ctx.fill();
      }
      drawSparkle(128, 128, 48);
      drawSparkle(80, 88, 18);
      drawSparkle(175, 165, 24);
    } else if (type === 'portfolio') {
      ctx.shadowColor = '#7DD3FC';
      ctx.strokeStyle = '#7DD3FC';
      ctx.lineWidth = 5;
      // Grid of portfolio components
      ctx.beginPath();
      ctx.roundRect(80, 80, 42, 42, 6);
      ctx.roundRect(134, 80, 42, 42, 6);
      ctx.roundRect(80, 134, 42, 42, 6);
      ctx.roundRect(134, 134, 42, 42, 6);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  // Helper to generate the Premium Resume Texture
  function createResumeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 728;
    const ctx = canvas.getContext('2d');

    // Translucent Card Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, 512, 728);

    // Subtle Grid pattern on card
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 728); ctx.stroke();
    }
    for (let y = 0; y < 728; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }

    // Top subtle gradient bar
    const barGrad = ctx.createLinearGradient(0, 0, 512, 0);
    barGrad.addColorStop(0, '#2563EB');
    barGrad.addColorStop(0.5, '#67E8F9');
    barGrad.addColorStop(1, '#A7F3D0');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, 512, 8);

    // Profile photo placeholder
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(103, 232, 249, 0.4)';
    const pfpGrad = ctx.createLinearGradient(40, 40, 120, 120);
    pfpGrad.addColorStop(0, '#67E8F9');
    pfpGrad.addColorStop(1, '#2563EB');
    ctx.fillStyle = pfpGrad;
    ctx.beginPath();
    ctx.arc(85, 85, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Profile Text
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 26px Outfit, sans-serif';
    ctx.fillText('Alex Rivers', 140, 78);
    
    ctx.fillStyle = '#67E8F9';
    ctx.font = '500 14px Inter, sans-serif';
    ctx.fillText('Lead AI Product Architect', 140, 102);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('San Francisco, CA  •  alex@resumeiq.ai', 140, 122);

    // Section 1: Executive Summary
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillText('EXECUTIVE SUMMARY', 45, 175);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(45, 185); ctx.lineTo(467, 185); ctx.stroke();

    // Summary mock lines
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(45, 202, 422, 6);
    ctx.fillRect(45, 218, 422, 6);
    ctx.fillRect(45, 234, 280, 6);

    // Section 2: Experience
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillText('PROFESSIONAL EXPERIENCE', 45, 275);
    ctx.beginPath(); ctx.moveTo(45, 285); ctx.lineTo(467, 285); ctx.stroke();

    // Role 1
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('Senior Engineering Manager', 45, 312);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Scale AI  •  2024 - Present', 320, 312);
    // Role 1 lines
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(45, 330, 422, 5);
    ctx.fillRect(45, 344, 422, 5);
    ctx.fillRect(45, 358, 380, 5);

    // Role 2
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('Staff Research Scientist', 45, 396);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Stripe Labs  •  2021 - 2024', 320, 396);
    // Role 2 lines
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(45, 414, 422, 5);
    ctx.fillRect(45, 428, 422, 5);
    ctx.fillRect(45, 442, 190, 5);

    // Section 3: Technical Skills (Mint Green capsules)
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillText('TECHNICAL EXPERTISE', 45, 485);
    ctx.beginPath(); ctx.moveTo(45, 495); ctx.lineTo(467, 495); ctx.stroke();

    function drawSkillBadge(text, x, y) {
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(167, 243, 208, 0.2)';
      ctx.fillStyle = 'rgba(167, 243, 208, 0.1)';
      ctx.strokeStyle = 'rgba(167, 243, 208, 0.4)';
      ctx.lineWidth = 1;
      
      const textWidth = ctx.measureText(text).width;
      const w = textWidth + 24;
      const h = 26;
      
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 13);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#A7F3D0';
      ctx.font = '500 11px Inter, sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText(text, x + 12, y + 17);
      
      return w;
    }

    let startX = 45;
    let startY = 512;
    const padding = 10;

    const skills = ['PyTorch', 'Transformers', 'TypeScript', 'Kubernetes', 'Next.js', 'LLMs', 'GraphQL', 'AWS'];
    
    for (let i = 0; i < skills.length; i++) {
      const badgeW = drawSkillBadge(skills[i], startX, startY);
      startX += badgeW + padding;
      if (startX > 400) {
        startX = 45;
        startY += 34;
      }
    }

    // Section 4: Education
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillText('EDUCATION', 45, 605);
    ctx.beginPath(); ctx.moveTo(45, 615); ctx.lineTo(467, 615); ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('M.S. in Artificial Intelligence', 45, 638);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Stanford University', 45, 656);

    // Glowing border frame around the canvas resume card
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 512, 728);

    return new THREE.CanvasTexture(canvas);
  }

  /* --------------------------------------------------
   * Lighting Environment
   * -------------------------------------------------- */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambientLight);

  // Directional Light 1 - Sky Blue Rim
  const dirLight1 = new THREE.DirectionalLight(0x7dd3fc, 1.25);
  dirLight1.position.set(-4, 6, 4);
  scene.add(dirLight1);

  // Directional Light 2 - Cyan Bright Front
  const dirLight2 = new THREE.DirectionalLight(0x67e8f9, 0.9);
  dirLight2.position.set(4, 5, 2);
  scene.add(dirLight2);

  // Point Light 3 - Upward Ocean Blue glow from platform
  const pointLightBlue = new THREE.PointLight(0x2563eb, 3.5, 8);
  pointLightBlue.position.set(0, -0.6, 0);
  scene.add(pointLightBlue);

  // Point Light 4 - Subtle Mint Green glow accent
  const pointLightMint = new THREE.PointLight(0xa7f3d0, 1.5, 6);
  pointLightMint.position.set(-2, 0.5, 1);
  scene.add(pointLightMint);

  /* --------------------------------------------------
   * 3D Platform (Circular futuristic base)
   * -------------------------------------------------- */
  const platformGroup = new THREE.Group();
  platformGroup.position.y = -1.25;
  scene.add(platformGroup);

  // Platform Outer Solid Ring
  const outerRingGeo = new THREE.CylinderGeometry(2.3, 2.35, 0.08, 64);
  const outerRingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.15,
    metalness: 0.9,
    transparent: true,
    opacity: 0.92,
    emissive: 0x090d16
  });
  const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
  platformGroup.add(outerRing);

  // Platform Core Glowing Grid
  const innerRingGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.02, 64);
  const innerRingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.8,
  });
  const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
  innerRing.position.y = 0.04;
  platformGroup.add(innerRing);

  // Technology grid lines on platform
  const gridHelper = new THREE.GridHelper(4.0, 20, 0x2563eb, 0x1e293b);
  gridHelper.position.y = 0.051;
  // Apply visual transparency to grid
  gridHelper.material.opacity = 0.35;
  gridHelper.material.transparent = true;
  platformGroup.add(gridHelper);

  // Cyber Rim Light ring
  const ringBorderGeo = new THREE.RingGeometry(2.18, 2.22, 64);
  ringBorderGeo.rotateX(-Math.PI / 2);
  const ringBorderMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75
  });
  const ringBorder = new THREE.Mesh(ringBorderGeo, ringBorderMat);
  ringBorder.position.y = 0.052;
  platformGroup.add(ringBorder);

  // Outer float ring
  const orbitRingGeo = new THREE.RingGeometry(2.9, 2.92, 90);
  orbitRingGeo.rotateX(-Math.PI / 2);
  const orbitRingMat = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.15
  });
  const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
  orbitRing.position.y = 0.01;
  platformGroup.add(orbitRing);

  /* --------------------------------------------------
   * Floating Resume Document Card
   * -------------------------------------------------- */
  const resumeGroup = new THREE.Group();
  scene.add(resumeGroup);

  // Slim box geometry to represent a premium thick document card
  const resumeCardGeo = new THREE.BoxGeometry(1.6, 2.28, 0.04);
  const resumeTex = createResumeTexture();
  
  // Custom materials (textured front face, glassmorphic sides & back)
  const resumeFrontMat = new THREE.MeshStandardMaterial({
    map: resumeTex,
    roughness: 0.15,
    metalness: 0.25,
    transparent: true,
    opacity: 0.95
  });
  
  const resumeGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide
  });

  const materials = [
    resumeGlassMat, // Right
    resumeGlassMat, // Left
    resumeGlassMat, // Top
    resumeGlassMat, // Bottom
    resumeFrontMat, // Front
    resumeGlassMat  // Back
  ];

  const resumeMesh = new THREE.Mesh(resumeCardGeo, materials);
  resumeMesh.castShadow = true;
  resumeMesh.receiveShadow = true;
  resumeGroup.add(resumeMesh);

  // Backing soft aura glow sprite direct behind card
  const glowTex = createGlowTexture();
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending
  });
  const resumeGlowSprite = new THREE.Sprite(glowMat);
  resumeGlowSprite.scale.set(3.2, 3.8, 1);
  resumeGlowSprite.position.z = -0.15;
  resumeGroup.add(resumeGlowSprite);

  function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }

  /* --------------------------------------------------
   * Orbiting Tech Ecosystem Badges
   * -------------------------------------------------- */
  const orbitingGroup = new THREE.Group();
  scene.add(orbitingGroup);

  const orbitAssets = [
    { type: 'pdf', radius: 2.1, speed: 0.4, yOffset: 0.6, yPhase: 0, scale: 0.52 },
    { type: 'ats', radius: 1.8, speed: -0.5, yOffset: -0.2, yPhase: Math.PI / 3, scale: 0.50 },
    { type: 'github', radius: 2.3, speed: 0.35, yOffset: 0.2, yPhase: Math.PI / 1.5, scale: 0.48 },
    { type: 'linkedin', radius: 1.9, speed: -0.45, yOffset: 0.8, yPhase: Math.PI, scale: 0.48 },
    { type: 'analytics', radius: 2.4, speed: 0.3, yOffset: -0.4, yPhase: Math.PI * 1.3, scale: 0.52 },
    { type: 'ai', radius: 1.7, speed: 0.6, yOffset: 0.4, yPhase: Math.PI * 1.6, scale: 0.54 },
    { type: 'portfolio', radius: 2.2, speed: -0.38, yOffset: 0.0, yPhase: Math.PI * 1.8, scale: 0.48 }
  ];

  const orbitMeshes = [];

  orbitAssets.forEach((asset) => {
    const texture = createIconTexture(asset.type);
    // Double sided translucent plane for orbiting cards
    const geo = new THREE.PlaneGeometry(asset.scale, asset.scale);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      metalness: 0.2,
      roughness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    orbitingGroup.add(mesh);
    
    // Track stats
    orbitMeshes.push({
      mesh: mesh,
      radius: asset.radius,
      speed: asset.speed,
      yOffset: asset.yOffset,
      yPhase: asset.yPhase,
      angle: Math.random() * Math.PI * 2
    });
  });

  /* --------------------------------------------------
   * Ambient Particle System (Magical micro dust)
   * -------------------------------------------------- */
  const particleCount = 280;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const particleData = [];

  for (let i = 0; i < particleCount; i++) {
    // Distribute randomly in a cylinder volume
    const radius = 0.5 + Math.random() * 3.2;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = -1.2 + Math.random() * 3.8;
    const z = Math.sin(angle) * radius;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    particleData.push({
      angle: angle,
      radius: radius,
      speed: 0.05 + Math.random() * 0.12,
      ySpeed: 0.002 + Math.random() * 0.006,
      direction: Math.random() > 0.5 ? 1 : -1
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Small soft particle point texture
  const particleTex = createParticleTexture();
  const particleMat = new THREE.PointsMaterial({
    size: 0.07,
    map: particleTex,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(103, 232, 249, 0.8)');
    grad.addColorStop(1, 'rgba(103, 232, 249, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  /* --------------------------------------------------
   * Cinematic Animation Loop (60 FPS focus)
   * -------------------------------------------------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // 1. Float & Slow Spin Resume Document
    const floatOffset = Math.sin(elapsedTime * 0.8) * 0.12;
    resumeGroup.position.y = floatOffset;
    // Rotate slowly and naturally
    resumeGroup.rotation.y = Math.sin(elapsedTime * 0.25) * 0.18 + (elapsedTime * 0.04);
    resumeGroup.rotation.x = Math.cos(elapsedTime * 0.2) * 0.05;

    // 2. Rotate Futuristic Platform ring
    outerRing.rotation.y = -elapsedTime * 0.08;
    innerRing.rotation.y = elapsedTime * 0.03;

    // 3. Orbit badges with correct depth/rotations
    orbitMeshes.forEach((item) => {
      item.angle += item.speed * 0.015;
      
      const x = Math.cos(item.angle) * item.radius;
      const z = Math.sin(item.angle) * item.radius;
      const y = item.yOffset + Math.sin(elapsedTime * 1.2 + item.yPhase) * 0.15;

      item.mesh.position.set(x, y, z);
      
      // Keep meshes facing camera for readability (billboarding effect)
      item.mesh.lookAt(camera.position);
      // Gentle self roll
      item.mesh.rotation.z += Math.sin(elapsedTime * 0.5 + item.yPhase) * 0.001;
    });

    // 4. Particle system movements
    const posArr = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const data = particleData[i];
      data.angle += data.speed * 0.002 * data.direction;
      
      // Update x, z coordinates on circular track
      posArr[i * 3] = Math.cos(data.angle) * data.radius;
      // Drift upwards, reset to bottom if it floats out of bounds
      posArr[i * 3 + 1] += data.ySpeed;
      if (posArr[i * 3 + 1] > 2.5) {
        posArr[i * 3 + 1] = -1.2;
      }
      posArr[i * 3 + 2] = Math.sin(data.angle) * data.radius;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // 5. Mouse Parallax (interpolate current camera to targets)
    // Lerp rate (0.05 for buttery smooth delay)
    mouseX += (targetX - mouseX) * 0.04;
    mouseY += (targetY - mouseY) * 0.04;

    // Adjust camera slightly based on mouse
    camera.position.x = mouseX * 0.8;
    camera.position.y = 1.2 + (mouseY * 0.6);
    // Dynamic look at focus
    camera.lookAt(new THREE.Vector3(0, floatOffset * 0.5, 0));

    // Render step
    renderer.render(scene, camera);
  }

  animate();
}
