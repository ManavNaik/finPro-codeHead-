// ===============================
// PROFILE.JS - Interactive Features
// ===============================

// --------- Profile Picture Preview with Animation ---------
const profileInput = document.getElementById('profilePicInput');
const profileImage = document.getElementById('profileImage');

profileInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      profileImage.src = event.target.result;
      // Add animation
      profileImage.classList.add('scale-110', 'transition-transform', 'duration-500');
      setTimeout(() => profileImage.classList.remove('scale-110'), 500);
    }
    reader.readAsDataURL(file);
  }
});

// --------- Dark Mode Toggle ---------
const darkToggle = document.getElementById('darkModeToggle');

if(darkToggle) {
  darkToggle.addEventListener('change', function() {
    if(this.checked) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-gray-900', 'text-white');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-gray-900', 'text-white');
    }
  });
}

// --------- Button Ripple Effect ---------
document.querySelectorAll('button').forEach(button => {
  // Ensure relative positioning
  button.classList.add('relative', 'overflow-hidden');
  
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'absolute rounded-full bg-white/30 animate-ping';
    ripple.style.width = ripple.style.height = '100px';
    ripple.style.left = `${e.offsetX - 50}px`;
    ripple.style.top = `${e.offsetY - 50}px`;
    ripple.style.pointerEvents = 'none';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// --------- Smooth Hover Effects on Cards ---------
document.querySelectorAll('.card').forEach(card => {
  card.classList.add('transition-transform', 'duration-300', 'hover:scale-105', 'hover:shadow-2xl');
});

// --------- Example: Save Preferences (Dummy) ---------
// Optional: save toggles in localStorage
document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
  toggle.addEventListener('change', function() {
    localStorage.setItem(this.id, this.checked);
  });

  // Load saved preference
  const saved = localStorage.getItem(toggle.id);
  if(saved !== null) toggle.checked = saved === 'true';
});
