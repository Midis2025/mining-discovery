

// Close popup function
function closePopup() {
  document.getElementById("popup2").style.display = "none";
}

// Subscribe function
async function subscribe() {
  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim();

  if (!email) {
    alert("Please enter your email!");
    return;
  }

  try {
    // POST request to live Strapi Subscriber API
    const response = await fetch("https://admins.miningdiscovery.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: { email }  // Wrap email inside 'data'
      })
    });

    if (response.ok) {
      const data = await response.json();
      alert("Thank you for subscribing!");
      emailInput.value = ""; // clear input
      closePopup();
    } else {
      const error = await response.json();
      console.error("Subscribe error:", error);

      // Check if it's a duplicate email
      if (error?.error?.details?.errors?.[0]?.message.includes("unique")) {
        alert("You are already subscribed!");
      } else {
        alert("Failed to subscribe. Please try again.");
      }
    }
  } catch (err) {
    console.error("Network error:", err);
    alert("Something went wrong. Please try again later.");
  }
}