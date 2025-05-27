export const MessageSkeleton: React.FC<{
  isUser?: boolean;
  lines?: number;
}> = ({ isUser = false, lines }) => {
  // Generar número aleatorio de líneas para hacer más realista
  const messageLines =
    lines ||
    (isUser
      ? Math.floor(Math.random() * 2) + 1
      : Math.floor(Math.random() * 4) + 2);

  return (
    <div
      className={`flex gap-3 mb-6 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Contenido del mensaje */}
      <div className={`max-w-[80%] min-w-[40%] ${isUser ? "order-first" : ""}`}>
        {/* Bubble del mensaje */}
        <div
          className={`
          px-4 py-3 rounded-2xl space-y-2
          ${
            isUser
              ? "bg-blue-500 ml-auto rounded-br-md"
              : "rounded-bl-md"
          }
        `}
        >
          {Array.from({ length: messageLines }).map((_, index) => (
            <div
              key={index}
              className={`h-4 w-[50%] rounded animate-pulse ${
                isUser ? "bg-blue-300" : "bg-gray-300"
              }`}
              style={{
                width:
                  index === messageLines - 1
                    ? `${Math.floor(Math.random() * 40) + 40}%`
                    : `${Math.floor(Math.random() * 30) + 70}%`,
              }}
            />
          ))}
        </div>

        {/* Timestamp skeleton */}
        {/* <div className={`mt-1 ${isUser ? "text-right" : "text-left"}`}>
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
        </div> */}
      </div>
    </div>
  );
};
