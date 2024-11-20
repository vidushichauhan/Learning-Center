export const fetchContents = async (repoName: string, path: string = ""): Promise<any[]> => {
  const apiUrl = path
    ? `http://localhost:4000/api/repos/${repoName}/contents/${path}`
    : `http://localhost:4000/api/repos/${repoName}/contents`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch folder contents");
  }

  return response.json();
};

