export const saveGeneratedPdf = async (doc, type, title) => {
    try {
        const blob = doc.output("blob");

        const formData = new FormData();

        formData.append(
            "pdf",
            blob,
            `${title.replace(/[^\w\s-]/g, "")}.pdf`
        );

        formData.append("type", type);
        formData.append("title", title);

        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/saved-pdfs`,
            {
                method: "POST",
                credentials: "include",
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to save PDF");
        }

        return data;
    } catch (error) {
        console.error("Auto-save to Saved Services failed:", error);
        return null;
    }
};