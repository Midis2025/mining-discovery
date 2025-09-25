const HOME_URL = "https://staging.miningdiscovery.com/index.html";

// Call this to protect a page (optional)
async function protectPage() {
  await loadClerkHeader(true);
}

// Unified header loader
async function loadClerkHeader(protect = false) {
  await Clerk.load();

  const loginBtn = document.getElementById("loginBtn");
  const userProfile = document.getElementById("userProfile");

  if (!loginBtn || !userProfile) {
    console.warn("Login button or userProfile element missing in header.");
    return;
  }

  function showUserProfile() {
    loginBtn.style.display = "none";
    userProfile.style.display = "inline-block";
    Clerk.mountUserButton(userProfile, {
      afterSignOut: () => window.location.href = HOME_URL
    });
  }

  function showLoginButton() {
    loginBtn.style.display = "inline-block";
    userProfile.style.display = "none";
  }

  loginBtn.addEventListener("click", () => {
    Clerk.openSignIn({
      afterSignInUrl: window.location.href,
      afterSignUpUrl: window.location.href
    });
  });

  if (Clerk.user) {
    showUserProfile();
  } else {
    showLoginButton();

    // Optionally protect page: redirect / block access
    if (protect) {
      Clerk.openSignIn({
        afterSignInUrl: window.location.href,
        afterSignUpUrl: window.location.href
      });
    }
  }
}

// Auto-run on every page for header
loadClerkHeader();
