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

  if (!download_url) {
    return <p className="text-gray-600">No content available for this module.</p>;
  }

  if (name.endsWith(".md")) {
    return (
      <div className="w-3/4 p-4">
        <ReactMarkdown className="bg-gray-100 p-4 rounded">
          {`# Markdown Content Loaded from ${download_url}`}
        </ReactMarkdown>
      </div>
    );
  } else if (name.match(/\.(png|jpg|jpeg|gif)$/i)) {
    return (
      <div className="w-3/4 p-4">
        <img
          src={download_url}
          alt={name}
          className="rounded border shadow-md"
        />
      </div>
    );
  } else if (name.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <div className="w-3/4 p-4">
  <video
    controls
    style={{ height: '500px' }} // Adjust the height as needed
    className="w-full rounded border shadow-md"
    src={download_url}
  >
    Your browser does not support the video tag.
  </video>
</div>

    );
  } else {
    return (
      <div className="w-3/4 p-4">
        <a
          href={download_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Download {name}
        </a>
      </div>
    );
  }
};

export default ContentViewer;
