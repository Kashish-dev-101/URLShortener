"use-strcit";

const urlInput = document.querySelector("#longUrl");
const form = document.querySelector("#shortener-form");
console.log(form);
const resultDiv = document.querySelector("#result");
console.log(result);

const shortUrl = document.querySelector("#shortUrl");

const baseUrl = window.location.origin;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("form submitted");
  const originalUrl = urlInput.value.trim();
  console.log(originalUrl);

  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: originalUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to shorten URL");
    }

    const data = await response.json();
    console.log("Shortened URL:", data);

    // Build your short link using the returned ID
    const shortLink = `${baseUrl}/url/${data.id}`;
    console.log(shortLink);

    // Example: show the shortened URL in your page
    // update the link
    shortUrl.href = shortLink;
    shortUrl.textContent = shortLink;

    // unhide the result section
    resultDiv.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong");
  }
});
