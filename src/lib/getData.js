export async function getData(endpoint) {
  // Build URL and always include populate=*
  const url = endpoint.includes("?")
    ? `${process.env.STRAPI_URL}/api/${endpoint}&populate=*`
    : `${process.env.STRAPI_URL}/api/${endpoint}?populate=*`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`❌ Failed to fetch ${endpoint}: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error in getData:", error);
    return null; // or throw error if you want Next.js error boundary to handle it
  }
}
