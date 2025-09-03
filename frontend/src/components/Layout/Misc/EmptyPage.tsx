import Image from "next/image";
import { cn } from "../../../../lib/utils";

interface EmptyPageProps {
  className?: string;
}

const EmptyPage = ({ className }: EmptyPageProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center h-full w-full",
      "text-muted-foreground",
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        <Image
          src="/file.svg"
          alt="File icon"
          width={64}
          height={64}
          className="opacity-50"
        />
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium text-foreground">
            No file is currently opened
          </h2>
          <p className="text-sm">
            Open a file to begin taking notes
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmptyPage;