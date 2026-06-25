import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { FlyerPreview, FlyerData } from "../components/FlyerPreview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, Download, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";

const urlToBase64 = async (url: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to convert image to base64", url, e);
    return url;
  }
};

export default function StudentForm() {
  const [data, setData] = useState<FlyerData>({
    full_name: "",
    nickname: "",
    state_of_origin: "",
    birthday: "",
    relationship_status: "",
    phone: "",
    best_course: "",
    challenging_course: "",
    best_level: "",
    challenging_level: "",
    favorite_lecturer: "",
    best_experience: "",
    post_held: "None",
    next_after_school: "",
    favorite_quote: "",
    photo_url: "",
  });

  const [localPhotoBase64, setLocalPhotoBase64] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.5);
  const previewRef = useRef<HTMLDivElement>(null);
  const hdRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive scale for the preview
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // 1080 is the native width of the flyer
        const scale = Math.min((containerWidth - 32) / 1080, 0.6);
        setPreviewScale(scale);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max size is 5MB");
      return;
    }

    // Set local base64 preview immediately to avoid CORS issues with html-to-image
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalPhotoBase64(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    const uploadToast = toast.loading("Uploading photo...");
    try {
      let uploadedUrl = "";
      let supabaseFailed = false;

      if (supabase) {
        try {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage
            .from("photos")
            .upload(fileName, file);

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabase.storage.from("photos").getPublicUrl(fileName);

          uploadedUrl = publicUrl;
        } catch (subErr) {
          console.warn(
            "Supabase upload failed, falling back to local api",
            subErr,
          );
          supabaseFailed = true;
        }
      }

      if (!supabase || supabaseFailed) {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        let json;
        try {
          json = await res.json();
        } catch (e) {
          throw new Error(
            `Server returned an invalid response (status: ${res.status})`,
          );
        }

        if (res.ok) {
          uploadedUrl = json.url;
        } else {
          throw new Error(json.error || "Local upload failed");
        }
      }

      setData((prev) => ({ ...prev, photo_url: uploadedUrl }));
      toast.success("Photo uploaded successfully!", { id: uploadToast });
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Try again.", {
        id: uploadToast,
      });
    }
  };

  const handleGenerate = async () => {
    if (!data.full_name || !data.photo_url) {
      toast.error("Please provide your name and passport photo");
      return;
    }

    setGenerating(true);
    const generationToast = toast.loading("Generating your premium flyer...");

    try {
      iif (!hdRef.current) {
  throw new Error("HD Preview ref missing");
}

      // Generate the flyer code first to display on the PNG
      const flyer_code = `NCC26-${Math.floor(1000 + Math.random() * 9000)}`;
      const flyerDataWithCode = { ...data, flyer_code };

      // Temporarily update data state to inject the code into the DOM before generating image
      setData(flyerDataWithCode);

      // Wait for React to render the code
      await new Promise(resolve=>setTimeout(resolve,500));

      // Generate Image
      //await new Promise(r=>setTimeout(r,500));
      const imgs = hdRef.current!.querySelectorAll("img");

await Promise.all(
  Array.from(hdRef.current.querySelectorAll("img")).map(img=>{
    if(img.complete) return Promise.resolve();

    return new Promise(resolve=>{
      img.onload=resolve;
      img.onerror=resolve;
    });
  })
);

const dataUrl = await toPng(hdRef.current!,{
        quality: 1.0,
        pixelRatio: 4, // High resolution
        useCORS: true,
        cacheBust: true, // Often helps with cached images throwing CORS
      });

      toast.loading("Saving to server...", { id: generationToast });

      let flyer_url = "";
      let dbErrorOccurred = false;
      let supabaseFailed = false;

      if (supabase) {
        try {
          // Supabase upload
          const blob = await (await fetch(dataUrl)).blob();
          const fileName = `flyer-${Date.now()}.png`;
          const { error: uploadError } = await supabase.storage
            .from("flyers")
            .upload(fileName, blob);
          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("flyers").getPublicUrl(fileName);
          flyer_url = publicUrl;

          const { error: dbError } = await supabase
            .from("students")
            .insert([
              { ...flyerDataWithCode, flyer_url, id: crypto.randomUUID() },
            ]);

          if (dbError) throw dbError;
        } catch (subErr) {
          console.warn(
            "Supabase generation/upload failed, falling back to local api",
            subErr,
          );
          supabaseFailed = true;
        }
      }

      if (!supabase || supabaseFailed) {
        // Upload Flyer via API
        const flyerRes = await fetch("/api/upload-flyer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: dataUrl }),
        });
        const flyerJson = await flyerRes.json();
        flyer_url = flyerJson.url;

        // Save to database
        const saveRes = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...flyerDataWithCode, flyer_url }),
        });

        if (!saveRes.ok) throw new Error("Failed to save data locally");
      }

      // Download it!
     const link = document.createElement("a");

link.href = dataUrl;
link.download = `${data.full_name.replace(/\s+/g, "_")}_NCC_Finalist.png`;

document.body.appendChild(link);

// Force browser download
requestAnimationFrame(() => {
  link.click();
  document.body.removeChild(link);
});

      toast.success("Flyer generated and downloaded successfully!", {
        id: generationToast,
      });
    } catch (err: any) {
      console.error("GENERATION ERROR", err);
      const errMsg =
        err?.message || typeof err === "string" ? err : JSON.stringify(err);
      toast.error("Failed to generate flyer. " + errMsg, {
        id: generationToast,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 py-6 px-4 md:px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              NCC Finalist Generator
            </h1>
            <p className="text-sm text-neutral-500">Federal Polytechnic Bida</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Form */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Create your legacy
            </h2>
            <p className="text-neutral-500">
              Fill in your details below. The preview updates instantly.
            </p>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold
tracking-[0.08em]
uppercase tracking-widest text-[#D4AF37] uppercase">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    name="full_name"
                    value={data.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nickname</Label>
                  <Input
                    name="nickname"
                    value={data.nickname}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State of Origin</Label>
                  <Input
                    name="state_of_origin"
                    value={data.state_of_origin}
                    onChange={handleChange}
                    placeholder="Niger State"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Birthday (Day & Month)</Label>
                  <Input
                    name="birthday"
                    value={data.birthday}
                    onChange={handleChange}
                    placeholder="12th August"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Relationship Status</Label>
                  <Select
                    onValueChange={(val) =>
                      handleSelectChange("relationship_status", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="In a relationship">
                        In a relationship
                      </SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Complicated">Complicated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    name="phone"
                    value={data.phone}
                    onChange={handleChange}
                    placeholder="08012345678"
                  />
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Best Course</Label>
                  <Input
                    name="best_course"
                    value={data.best_course}
                    onChange={handleChange}
                    placeholder="e.g. Cloud Security"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Most Challenging Course</Label>
                  <Input
                    name="challenging_course"
                    value={data.challenging_course}
                    onChange={handleChange}
                    placeholder="e.g. Adv. Networking"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Best Level</Label>
                  <Input
                    name="best_level"
                    value={data.best_level}
                    onChange={handleChange}
                    placeholder="e.g. HND 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Most Challenging Level</Label>
                  <Input
                    name="challenging_level"
                    value={data.challenging_level}
                    onChange={handleChange}
                    placeholder="e.g. ND 2"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Favorite Lecturer</Label>
                  <Input
                    name="favorite_lecturer"
                    value={data.favorite_lecturer}
                    onChange={handleChange}
                    placeholder="e.g. Mr. Smith"
                  />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase">
                Campus Experience
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Best Experience in NCC</Label>
                  <Textarea
                    name="best_experience"
                    value={data.best_experience}
                    onChange={handleChange}
                    placeholder="Your best memory..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Post Held (Optional)</Label>
                  <Input
                    name="post_held"
                    value={data.post_held}
                    onChange={handleChange}
                    placeholder="e.g. Class Rep, PRO"
                  />
                </div>
              </div>
            </div>

            {/* Future & Quote */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase">
                Final Thoughts
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What's Next After School?</Label>
                  <Input
                    name="next_after_school"
                    value={data.next_after_school}
                    onChange={handleChange}
                    placeholder="e.g. Cloud Architect at Google"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Favorite Quote</Label>
                  <Textarea
                    name="favorite_quote"
                    value={data.favorite_quote}
                    onChange={handleChange}
                    placeholder="Your favorite quote..."
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase">
                Passport Photo *
              </h3>
              <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  {data.photo_url ? (
                    <div className="text-green-600 flex items-center gap-2">
                      <UploadCloud className="w-6 h-6" />
                      <span className="font-medium">
                        Photo uploaded! Click to change.
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-neutral-400" />
                      <p className="text-sm font-medium text-neutral-600">
                        Click to upload HD Passport
                      </p>
                      <p className="text-xs text-neutral-400">
                        Max 5MB (PNG, JPG)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full h-14 text-lg bg-[#D4AF37] hover:bg-[#b8952b] text-white rounded-xl shadow-lg shadow-[#D4AF37]/20 transition-all active:scale-[0.98]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Generate & Download Flyer
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Preview */}
        <div className="group-hover:scale-[1.01] transition-transform duration-500 origin-top">
    <FlyerPreview
        data={{
            ...data,
            photo_url: localPhotoBase64 || data.photo_url,
        }}
        ref={previewRef}
        scale={previewScale}
    />
</div>
     <div
    style={{
    position:"fixed",
    left:"-99999px",
    top:0,
    opacity:1,
    pointerEvents:"none"
}}
>
    <FlyerPreview
        ref={hdRef}
        data={{
            ...data,
            photo_url: localPhotoBase64 || data.photo_url,
        }}
        scale={1}
    />
</div>

</main>
    </div>
  );
}
