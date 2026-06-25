import React, { forwardRef } from 'react';

export interface FlyerData {
  full_name: string;
  nickname?: string;
  state_of_origin: string;
  birthday: string;
  relationship_status: string;
  phone: string;
  best_course: string;
  challenging_course: string;
  best_level: string;
  challenging_level: string;
  favorite_lecturer: string;
  best_experience: string;
  post_held: string;
  next_after_school: string;
  favorite_quote: string;
  photo_url: string;
  flyer_code?: string;
}

interface FlyerPreviewProps {
  data: FlyerData;
  scale?: number;
}

export const FlyerPreview = forwardRef<HTMLDivElement, FlyerPreviewProps>(({ data, scale = 1 }, ref) => {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: 1080,
        height: 1350,
        backgroundColor: "#F7F7F7",
      }}
      className="relative overflow-hidden shrink-0"
      ref={ref}
    >
      {/* Dark Side Background */}
      <div className="absolute inset-0 bg-[#0B5D3B] z-0">
         <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#114B36] via-[#0B5D3B] to-[#114B36]"></div>
         <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ffffff_10px,#ffffff_20px)] mix-blend-overlay"></div>
         
         {/* Cloud/Networking subtle background nodes on dark side */}
         <svg className="absolute inset-0 w-full h-full opacity-[0.15]" viewBox="0 0 1080 1350">
           <path d="M100 800 L300 900 L150 1050 L350 1150 L200 1250" stroke="#D4AF37" strokeWidth="1" fill="none" strokeDasharray="4,4"/>
           <path d="M300 900 L400 1000 L350 1150" stroke="#D4AF37" strokeWidth="1" fill="none" strokeDasharray="4,4"/>
           <circle cx="100" cy="800" r="4" fill="#D4AF37"/>
           <circle cx="300" cy="900" r="5" fill="#D4AF37"/>
           <circle cx="150" cy="1050" r="3" fill="#D4AF37"/>
           <circle cx="350" cy="1150" r="6" fill="#D4AF37"/>
           <circle cx="200" cy="1250" r="4" fill="#D4AF37"/>
           <circle cx="400" cy="1000" r="4" fill="#D4AF37"/>
           
           {/* Abstract Cloud Shape */}
           <path d="M 250 850 Q 280 820 320 850 Q 360 830 380 870 Q 410 880 400 910 Q 420 940 380 960 Q 350 980 310 950 Q 270 970 240 940 Q 210 910 230 880 Q 210 850 250 850 Z" stroke="#ffffff" strokeWidth="1" fill="none" strokeDasharray="2,6" opacity="0.5"/>
         </svg>
      </div>

      {/* Light Side Background (Diagonal) */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 1080 1350" preserveAspectRatio="none">
         <defs>
           <pattern id="diagonalStripes" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
             <line x1="0" y1="0" x2="0" y2="10" stroke="#000000" strokeWidth="1" opacity="0.03" />
           </pattern>
           <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
             <feGaussianBlur stdDeviation="4" result="blur" />
             <feComposite in="SourceGraphic" in2="blur" operator="over" />
           </filter>
         </defs>
         
         {/* White area */}
         <polygon points="520,0 1080,0 1080,1350 380,1350" fill="#F7F7F7" />
         
         {/* Stripes only on white area */}
         <polygon points="520,0 1080,0 1080,1350 380,1350" fill="url(#diagonalStripes)" />
         
         {/* Gold Divider line with glow */}
         <line x1="520" y1="0" x2="380" y2="1350" stroke="#D4AF37" strokeWidth="2.5" filter="url(#glow)" opacity="0.8" />
         <line x1="520" y1="0" x2="380" y2="1350" stroke="#D4AF37" strokeWidth="1.5" />
      </svg>
      
      {/* White area decorations */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ clipPath: 'polygon(48.1% 0, 100% 0, 100% 100%, 35.1% 100%)' }}>
         <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[280px] font-['Playfair_Display'] font-bold text-[#0B5D3B] tracking-tighter">
           NCC
         </div>
         {/* Subtle network dots */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0B5D3B 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      </div>

      {/* Header (Logos & Dept) */}
      <div className="absolute top-[60px] left-[60px] flex items-center gap-4 z-20 w-[400px]">
        <div className="flex flex-col">
          <p className="text-white text-[11px] font-['Montserrat'] font-bold tracking-[0.15em] uppercase">Federal Polytechnic Bida</p>
          <p className="text-[#D4AF37] text-[9px] font-['Montserrat'] font-bold tracking-[0.2em] uppercase mt-1">Networking Class of 2026</p>
        </div>
      </div>

      {/* FYB Typography block */}
      <div className="absolute top-[160px] left-[60px] z-20">
         <div className="flex flex-col">
            <h2 className="text-[#FFE800] text-[75px] leading-[0.9] font-['Montserrat'] font-medium uppercase tracking-tight">
              FYB '26
            </h2>
            <p className="text-[#E0E0E0] text-[14px] font-['Montserrat'] font-medium italic tracking-widest mt-1">
              BUILDERS AND FOUNDERS EDITION
            </p>
         </div>
         <div className="mt-1 text-[#FFE800] text-[95px] leading-[0.85] font-['Montserrat'] font-black uppercase tracking-tighter scale-y-[1.1] origin-left">
            NETWORKING
         </div>
         <div className="bg-[#388E3C] text-white px-6 py-2 mt-6 -rotate-2 shadow-2xl inline-block transform origin-left border border-white/10">
            <span className="text-[15px] font-bold tracking-[0.15em] font-['Montserrat'] uppercase italic drop-shadow-md">
              STUDENT OF THE WEEK
            </span>
         </div>
      </div>

      {/* Photo Card */}
      <div className="absolute top-[440px] left-[60px] w-[460px] bg-white rounded-[22px] shadow-[0_30px_60px_rgba(0,0,0,0.15)] p-5 pb-8 z-30 border-[2px] border-[#D4AF37]/40">
         <div className="w-full h-[540px] bg-[#F7F7F7] rounded-[14px] overflow-hidden relative">
            {data.photo_url ? (
              <img src={data.photo_url} alt="Passport" className="w-full h-full object-cover object-top" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-3">
                 <div className="w-20 h-20 border-2 border-dashed border-neutral-300 rounded-full"></div>
                 <p className="text-sm font-['Montserrat'] font-semibold uppercase tracking-widest">Photo Here</p>
              </div>
            )}
         </div>
         <div className="mt-8 text-center space-y-1">
            <h2 className="text-[26px] font-['Poppins'] font-extrabold text-[#1E1E1E] uppercase tracking-wide leading-[1.1] px-4">{data.full_name || "YOUR NAME"}</h2>
            {data.nickname && (
               <p className="text-[16px] font-['Poppins'] font-semibold text-[#D4AF37] tracking-[0.1em] uppercase mt-1">Nickname : {data.nickname}</p>
            )}
            
            <div className="flex items-center justify-center gap-3 mt-4">
               <div className="h-px w-8 bg-[#D4AF37]"></div>
               <p className="text-[11px] font-['Montserrat'] font-bold tracking-[0.2em] text-[#1E1E1E] uppercase">{data.post_held !== "None" ? data.post_held : "Social Handle : @networking"}</p>
               <div className="h-px w-8 bg-[#D4AF37]"></div>
            </div>
         </div>
      </div>

      {/* Quote Section at bottom left (under photo) */}
      <div className="absolute bottom-[50px] left-[60px] w-[350px] z-20 flex items-center gap-4">
         <div className="flex-1">
           <p className="text-[#D4AF37] text-[60px] font-['Great_Vibes'] drop-shadow-md leading-none">{data.favorite_quote ? '“' + data.favorite_quote.split(' ')[0] : 'Grateful Soul'}</p>
         </div>
         <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
         </div>
      </div>

      {/* Right Column Information Card */}
      <div className="absolute top-[80px] right-[60px] w-[460px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-10 z-20 border border-white/50 backdrop-blur-sm">
         <div className="flex flex-col gap-[28px]">
           
           <InfoSection title="Personal Profile">
             <DetailRow label="State of Origin" value={data.state_of_origin} />
             <DetailRow label="Birthday" value={data.birthday} />
             <DetailRow label="Relationship Status" value={data.relationship_status} />
             <DetailRow label="Phone Number" value={data.phone} />
           </InfoSection>

           <InfoSection title="Academic Profile">
             <DetailRow label="Best Course & Level" value={`${data.best_course} / ${data.best_level}`} />
             <DetailRow label="Hardest Course & Level" value={`${data.challenging_course} / ${data.challenging_level}`} />
             <DetailRow label="Favorite Lecturer" value={data.favorite_lecturer} />
           </InfoSection>

           <InfoSection title="Campus Experience">
             <DetailRow label="Best Experience In Campus" value={data.best_experience} />
             <DetailRow label="Post Held" value={data.post_held} />
           </InfoSection>

           <InfoSection title="Future">
             <DetailRow label="What's Next After School" value={data.next_after_school} />
           </InfoSection>

           <InfoSection title="Departing Words">
             <DetailRow label="Favorite Quote" value={data.favorite_quote} isQuote />
           </InfoSection>

         </div>
      </div>

      {/* Decorative Elegant Curved Gold Accent */}
      <div className="absolute top-[0] right-[0] w-[150px] h-[150px] overflow-hidden z-30 pointer-events-none">
         <div className="absolute top-[-75px] right-[-75px] w-[150px] h-[150px] rounded-full border-[1.5px] border-[#D4AF37]/40"></div>
         <div className="absolute top-[-60px] right-[-60px] w-[120px] h-[120px] rounded-full border-[1px] border-[#D4AF37]/30"></div>
      </div>
      
      {/* Tiny geometric shapes low opacity */}
      <div className="absolute bottom-[200px] left-[46%] w-2 h-2 rotate-45 border border-[#D4AF37]/30 z-20 pointer-events-none"></div>
      <div className="absolute top-[100px] left-[52%] w-1.5 h-1.5 rounded-full bg-[#0B5D3B]/10 z-20 pointer-events-none"></div>

      {/* Premium Footer */}
      <div className="absolute bottom-[50px] right-[60px] w-[460px] z-20 flex items-center justify-between">
         <div className="flex flex-col">
            <h4 className="text-[12px] font-['Montserrat'] font-bold text-[#1E1E1E] uppercase tracking-[0.25em]">Networking & Cloud Computing</h4>
            <div className="w-[80px] h-[1.5px] bg-gradient-to-r from-[#D4AF37] to-transparent my-1.5"></div>
            <p className="text-[10px] font-['Inter'] font-semibold text-[#1E1E1E]/60 uppercase tracking-widest">Federal Polytechnic Bida</p>
            <p className="text-[9px] font-['Montserrat'] font-bold text-[#D4AF37] uppercase tracking-[0.3em] mt-0.5">Class of 2026</p>
         </div>

         {/* Premium Rounded Badge */}
         <div className="w-[70px] h-[70px] rounded-full bg-[#0B5D3B] flex flex-col items-center justify-center shadow-[0_10px_20px_rgba(11,93,59,0.3)] border-[2px] border-[#D4AF37]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4AF37] mb-0.5"><path d="M12 2L2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
            <span className="text-[10px] font-['Montserrat'] font-extrabold text-white tracking-widest">NCC</span>
            <span className="text-[8px] font-['Inter'] font-semibold text-[#D4AF37] tracking-widest leading-none mt-0.5">'26</span>
         </div>
      </div>

    </div>
  );
});

function InfoSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 relative">
       {/* Section Header */}
       <div className="flex items-center gap-3">
         <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
         <h3 className="text-[13px] font-['Playfair_Display'] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">{title}</h3>
         <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D4AF37]/40 to-transparent"></div>
       </div>
       <div className="flex flex-col gap-4 pl-4">
         {children}
       </div>
    </div>
  );
}

function DetailRow({ label, value, isQuote = false }: { label: string; value: string, isQuote?: boolean }) {
  const displayValue = value && value !== " / " ? value : "-";
  
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-['Montserrat'] font-semibold text-[#1E1E1E]/60 uppercase tracking-[0.15em]">{label} :</span>
      <span className={`text-[14px] font-['Inter'] ${isQuote ? 'font-medium italic leading-snug' : 'font-semibold'} text-[#1E1E1E] uppercase tracking-wide leading-tight break-words pr-4`}>
        {displayValue}
      </span>
    </div>
  );
}
