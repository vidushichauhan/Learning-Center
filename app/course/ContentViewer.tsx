import React from "react";
import ReactMarkdown from "react-markdown";

interface RepoContent {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
}

interface ContentViewerProps {
  selectedModule: RepoContent | null;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ selectedModule }) => {
  if (!selectedModule) {
    return <p className="text-gray-600">Select a module to view its content.</p>;
  }

  const { name, download_url } = selectedModule;

  if (name.endsWith(".md")) {
    return (
      <div className="w-3/4 p-4">
        <ReactMarkdown className="bg-gray-100 p-4 rounded">
          {download_url ? `# Markdown Content Loaded from ${download_url}` : ""}
        </ReactMarkdown>
      </div>
    );
  } else if (name.match(/\.(png|jpg|jpeg|gif)$/i)) {
    return (
      <div className="w-3/4 p-4">
        <img src={download_url || ""} alt={name} className="rounded border shadow-md" />
      </div>
    );
  } else {
    return (
      <div className="w-3/4 p-4">
        <iframe
          src={`https://docs.google.com/gview?url=${download_url}&embedded=true`}
          className="w-full h-96 rounded border shadow-md"
          frameBorder="0"
        ></iframe>
      </div>
    );
  }
};

export default ContentViewer;
