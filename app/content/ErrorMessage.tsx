interface ErrorMessageProps {
    message: string;
  }
  
  const ErrorMessage = ({ message }: ErrorMessageProps) => (
    <p className="text-red-500 text-center">Error: {message}</p>
  );
  
  export default ErrorMessage;
  