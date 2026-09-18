export async function generateContent(prompt, file) {
  //console.log("From genetarecontent.js(prompt) : " + prompt);
  //console.log("From genetarecontent.js(file) : " + file);

  const formData = new FormData();

  formData.append("prompt", prompt);
  formData.append("pdf", file[0]);
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/gemini/generate`,
    {
      method: "POST",
      body: formData,
    },
  );
  if (!response.ok) {
    throw new Error("Failed to generate content.(from generatecontent.js)");
  }

  const data = await response.json();
  console.log(
    "From generatecontent.js JSON.stringify(response) : " +
      JSON.stringify(response),
  );

  return data;
}
