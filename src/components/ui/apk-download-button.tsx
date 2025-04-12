import { useState } from "react";
import { Button } from "./button";
import { Download, Loader2 } from "lucide-react";
import { recordDownload } from "@/lib/download-tracker";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Type for APK version
export interface ApkVersion {
  id: string;
  version_name: string;
  version_code: number;
  apk_url: string;
  release_notes?: string;
  release_date: string;
}

// Form schema for email
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface ApkDownloadButtonProps {
  version: ApkVersion;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showVersionName?: boolean;
  collectEmail?: boolean;
}

export function ApkDownloadButton({
  version,
  variant = "default",
  size = "default",
  className = "",
  showVersionName = false,
  collectEmail = false
}: ApkDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const { toast } = useToast();
  
  // Set up form for email collection
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ""
    }
  });

  // Handle download click
  const handleDownload = async (email?: string) => {
    setLoading(true);
    
    try {
      // Record the download
      await recordDownload(version.id, { email });
      
      // Initiate the download
      const link = document.createElement('a');
      link.href = version.apk_url;
      link.setAttribute('download', `app-${version.version_name}.apk`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: `App version ${version.version_name} is downloading.`
      });
    } catch (error) {
      console.error("Error downloading APK:", error);
      toast({
        title: "Download failed",
        description: "There was an error starting your download. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowEmailDialog(false);
      reset();
    }
  };
  
  // Handle button click - either show dialog or download directly
  const onButtonClick = () => {
    // Check if we already have user info
    const userData = localStorage.getItem("user");
    
    if (userData || !collectEmail) {
      // We have user data or don't need to collect email, proceed with download
      handleDownload();
    } else {
      // Show email collection dialog
      setShowEmailDialog(true);
    }
  };
  
  // Handle email form submission
  const onEmailSubmit = (data: EmailFormValues) => {
    handleDownload(data.email);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={onButtonClick}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
        Download
        {showVersionName && ` v${version.version_name}`}
      </Button>
      
      {/* Email collection dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter your email</DialogTitle>
            <DialogDescription>
              Please provide your email to download the APK. This helps us keep track of our user base.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Download
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 